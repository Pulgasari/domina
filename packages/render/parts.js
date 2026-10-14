// @domina/render/parts.js
// a part is one hole of a template instance: it keeps its last value and writes
// only on a change. a child part owns the nodes between two comments and holds
// text, a node, a nested template instance, a list or what a helper describes.
//
// a function in a value hole is a live binding when the context has an effect
// function: the part runs it inside an effect and writes each result. without
// one it is called once per render. event and ref holes take functions as they are.

import { isWritable } from '@domina/methods/updateElement.js';

import { SVG_NS, compile, isHole, isParts, joinClasses } from './compile.js';

export const RESULT    = Symbol('domina.render.result');
export const DIRECTIVE = Symbol('domina.render.directive');

const RAW_HTML = '!html';

const isFn       = value => typeof value === 'function';
const isResult   = value => value?.[RESULT] === true;
const isObject   = value => value !== null && typeof value === 'object';
const directive  = value => isObject(value) ? value[DIRECTIVE] : undefined;

// effect(fn) returns a function or an object with dispose()
function live (context, fn) {
  const stop = context.effect(fn);
  return isFn(stop) ? stop : () => stop?.dispose?.();
}

const read = (value, values) =>
    isHole(value)  ? values[value.hole]
  : isParts(value) ? value.parts.map(part => isHole(part) ? String(values[part.hole] ?? '') : part).join('')
  :                  value;

// moves a node, keeping its state where the platform can (Element.moveBefore)
function move (node, anchor) {
  const parent = anchor.parentNode;
  if (parent.moveBefore && node.isConnected && anchor.isConnected) {
    try { parent.moveBefore(node, anchor); return; } catch {}
  }
  parent.insertBefore(node, anchor);
}

// :::::: PROPS
// the rules of @domina/methods/updateElement, with memory of the last value

const kebab = name => name.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);

function applyStyle (node, value, state) {
  if (value == null || typeof value === 'string') {
    state.style = null;
    value == null ? node.removeAttribute('style') : node.setAttribute('style', value);
    return;
  }
  const previous = state.style ?? {};
  for (const key in previous) if (!(key in value)) node.style.removeProperty(key.startsWith('--') ? key : kebab(key));
  for (const key in value) {
    if (previous[key] === value[key]) continue;
    const property = key.startsWith('--') || key.includes('-') ? key : kebab(key);
    value[key] == null ? node.style.removeProperty(property) : node.style.setProperty(property, String(value[key]));
  }
  state.style = { ...value };
}

export function applyProp (node, name, value, state) {
  if (name === 'key') return;

  if (name === 'ref') {
    if (value === state.ref) return;
    state.ref = value;
    if (isFn(value)) value(node);
    else if (isObject(value)) value.current = node;
    return;
  }

  if (name === RAW_HTML) { node.innerHTML = value ?? ''; return; }

  // one listener per prop, calling whatever handler the last render gave
  if (name.startsWith('on') && (isFn(value) || state.listener)) {
    state.handler = isFn(value) ? value : null;
    if (!state.listener) {
      state.listener = event => state.handler?.call(node, event);
      node.addEventListener(name.slice(2).toLowerCase(), state.listener);
    }
    return;
  }

  if (name === 'style') return applyStyle(node, value, state);

  if (name === 'class' || name === 'className') {
    const text = isObject(value) ? joinClasses([['class', value]]) : (value ?? '');
    node.setAttribute('class', text);
    return;
  }

  if (name === 'dataset' || name === 'data') { Object.assign(node.dataset, value); return; }

  if (!(node instanceof SVGElement) && name in node && isWritable(node, name)) { node[name] = value; return; }

  const aria = name.startsWith('aria-');
  if (value == null || (value === false && !aria)) node.removeAttribute(name);
  else if (value === true && !aria) node.setAttribute(name, '');
  else node.setAttribute(name, String(value));
}

// :::::: CHILD PART

export class ChildPart {
  constructor (start, end, context) {
    this.start   = start;
    this.end     = end;
    this.context = context;
    this.kind    = null;
    this.last    = undefined;
    this.stop    = null;
  }

  get svg () {
    const parent = this.end.parentNode;
    return parent?.namespaceURI === SVG_NS && parent.localName !== 'foreignObject';
  }

  commit (value) {
    // a helper with a function as its source follows that function live
    const type   = directive(value);
    const source = type === 'each' ? value.items : type === 'when' ? value.condition : null;

    if (this.context.effect && (isFn(value) || isFn(source))) {
      if (value === this.last) return;
      this.halt();
      this.last = value;
      this.stop = live(this.context, () => this.set(isFn(value) ? value() : { ...value, [type === 'each' ? 'items' : 'condition']: source() }));
      return;
    }

    if (value === this.last && !isObject(value)) return;
    this.halt();
    this.last = value;
    this.set(isFn(value) ? value() : value);
  }

  halt () { this.stop?.(); this.stop = null; }

  set (value) {
    const type = directive(value);
    if (type === 'each')          this.each(value);
    else if (type === 'when')     this.when(value);
    else if (type === 'raw')      this.raw(value.html);
    else if (isResult(value))     this.result(value);
    else if (Array.isArray(value)) this.list(value);
    else if (value instanceof Node) this.node(value);
    else if (value == null || typeof value === 'boolean') this.clear();
    else this.text(String(value));
  }

  text (text) {
    if (this.kind === 'text') { if (this.content.data !== text) this.content.data = text; return; }
    this.clear();
    this.kind    = 'text';
    this.content = document.createTextNode(text);
    this.end.before(this.content);
  }

  node (node) {
    if (this.kind === 'node' && this.content === node) return;
    this.clear();
    this.kind    = 'node';
    this.content = node;
    this.end.before(node);
  }

  result ({ program, values }) {
    if (this.kind === 'instance' && this.content.program === program) { this.content.update(values); return; }
    this.clear();
    const instance = new TemplateInstance(program, this.context, this.svg);
    instance.update(values);
    this.kind    = 'instance';
    this.content = instance;
    this.end.before(instance.fragment);
  }

  // markup that already is markup, parsed only when it changed. inert while
  // parsing: a template runs no script and loads nothing until inserted
  raw (markup) {
    const text = markup == null ? '' : String(markup);
    if (this.kind === 'raw' && this.content === text) return;
    this.clear();
    this.kind    = 'raw';
    this.content = text;
    const template = document.createElement('template');
    template.innerHTML = text;
    this.end.before(template.content);
  }

  // a new part of its own before the end of this one
  slot () {
    const start = document.createComment('');
    const end   = document.createComment('');
    this.end.before(start, end);
    return new ChildPart(start, end, this.context);
  }

  list (items) {
    if (this.kind !== 'list') { this.clear(); this.kind = 'list'; this.content = []; }
    const slots = this.content;
    items.forEach((item, index) => (slots[index] ??= this.slot()).commit(item));
    for (const slot of slots.splice(items.length)) slot.remove();
  }

  // a keyed list: rows keep their nodes when they move
  each ({ items, key, row }) {
    if (this.kind !== 'each') { this.clear(); this.kind = 'each'; this.content = new Map; }
    const previous = this.content;
    const next     = new Map;
    const order    = [];

    let index = 0;
    for (const item of items ?? []) {
      const id = key(item, index);
      let slot = previous.get(id);
      if (slot) previous.delete(id);
      else slot = this.slot();
      slot.commit(row(item, index));
      next.set(id, slot);
      order.push(slot);
      index++;
    }

    for (const slot of previous.values()) slot.remove();

    // walk back to front: every row goes right before the one after it
    let anchor = this.end;
    for (let i = order.length - 1; i >= 0; i--) {
      const slot = order[i];
      if (slot.end.nextSibling !== anchor) slot.moveBefore(anchor);
      anchor = slot.start;
    }

    this.content = next;
  }

  // the branch is told apart by the condition, not by the function: a template
  // creates new arrow functions on every render
  when ({ condition, then, otherwise }) {
    const key    = condition ? 'then' : 'otherwise';
    const branch = condition ? then : otherwise;
    if (this.kind !== 'when') { this.clear(); this.kind = 'when'; this.content = { key: null, part: this.slot() }; }
    const state = this.content;
    if (state.key !== key) { state.part.dispose(); state.part.last = undefined; state.key = key; }
    state.part.commit(branch ? branch() : null);
  }

  moveBefore (anchor) {
    const nodes = [];
    for (let node = this.start; node; node = node.nextSibling) { nodes.push(node); if (node === this.end) break; }
    for (const node of nodes) move(node, anchor);
  }

  // removes what this part holds, disposing nested instances and effects
  clear () {
    const { content, kind } = this;
    if (kind === 'instance') content.dispose();
    if (kind === 'list')     content.forEach(slot => slot.dispose());
    if (kind === 'each')     content.forEach(slot => slot.dispose());
    if (kind === 'when')     content.part.dispose();
    this.kind = this.content = null;
    while (this.start.nextSibling && this.start.nextSibling !== this.end) this.start.nextSibling.remove();
  }

  dispose () { this.halt(); this.clear(); }

  remove () { this.dispose(); this.start.remove(); this.end.remove(); }
}

// :::::: ATTRIBUTE-LIKE PARTS

class PropPart {
  constructor (node, { name, value }, context) {
    this.node    = node;
    this.name    = name;
    this.value   = value;
    this.context = context;
    this.state   = {};
    this.last    = undefined;
    this.stop    = null;
  }

  update (values) {
    const value = read(this.value, values);
    const takesFunctions = this.name === 'ref' || this.name.startsWith('on');

    if (isFn(value) && !takesFunctions && this.context.effect) {
      if (value === this.last) return;
      this.dispose();
      this.last = value;
      this.stop = live(this.context, () => applyProp(this.node, this.name, value(), this.state));
      return;
    }

    if (Object.is(value, this.last)) return;
    this.dispose();
    this.last = value;
    applyProp(this.node, this.name, isFn(value) && !takesFunctions ? value() : value, this.state);
  }

  dispose () { this.stop?.(); this.stop = null; }
}

// class and style keep every write: the static ones and the holes, merged per render
class MergedPart {
  constructor (node, { entries, kind }, context) {
    this.node    = node;
    this.entries = entries;
    this.kind    = kind;
    this.context = context;
    this.state   = {};
    this.last    = undefined;
    this.stop    = null;
  }

  write (resolve) {
    if (this.kind === 'class') {
      const text = joinClasses(this.entries, resolve);
      if (text !== this.last) { this.last = text; text ? this.node.setAttribute('class', text) : this.node.removeAttribute('class'); }
      return;
    }
    let merged;
    for (const [, value] of this.entries) {
      const resolved = resolve(value);
      if (!resolved) continue;
      if (typeof resolved === 'string') merged = resolved;
      else merged = { ...(isObject(merged) ? merged : {}), ...resolved };
    }
    applyStyle(this.node, merged ?? null, this.state);
  }

  update (values) {
    this.dispose();
    const resolve = value => { const resolved = read(value, values); return isFn(resolved) ? resolved() : resolved; };
    const fns     = this.entries.some(([, value]) => isFn(read(value, values)));
    if (fns && this.context.effect) this.stop = live(this.context, () => this.write(resolve));
    else this.write(resolve);
  }

  dispose () { this.stop?.(); this.stop = null; }
}

class SpreadPart {
  constructor (node, { hole }) {
    this.node   = node;
    this.hole   = hole;
    this.states = new Map;
    this.last   = {};
  }

  update (values) {
    const next = values[this.hole] ?? {};
    for (const name in this.last) if (!(name in next)) applyProp(this.node, name, null, this.states.get(name) ?? {});
    for (const name in next) {
      if (Object.is(next[name], this.last[name])) continue;
      if (!this.states.has(name)) this.states.set(name, {});
      applyProp(this.node, name, next[name], this.states.get(name));
    }
    this.last = { ...next };
  }

  dispose () {}
}

// an element whose tag is a hole, or a component: built per render from its props
class NodePart {
  constructor (start, end, { node, svg }, context) {
    this.child   = new ChildPart(start, end, context);
    this.desc    = node;
    this.svg     = svg;
    this.element = null;
    this.tag     = null;
    this.states  = new Map;
  }

  props (values) {
    const props   = {};
    const classes = [];
    for (const prop of this.desc.props) {
      if (!Array.isArray(prop)) { Object.assign(props, values[prop.spread]); continue; }
      const [name, value] = prop;
      if (name === 'class' || name === 'className' || (typeof name === 'string' && name.startsWith('class:'))) classes.push([name, value]);
      else props[name] = read(value, values);
    }
    if (classes.length) props.class = joinClasses(classes, value => read(value, values)) || undefined;
    return props;
  }

  update (values) {
    const tag      = read(this.desc.tag, values);
    const props    = this.props(values);
    const children = this.desc.children.length ? { [RESULT]: true, program: this.desc.program, values } : null;

    if (isFn(tag)) { this.child.commit(tag(props, children)); return; }

    if (tag !== this.tag) {
      this.tag     = tag;
      this.states  = new Map;
      this.element = this.svg || tag === 'svg' ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
      this.child.node(this.element);
    }
    for (const name in props) {
      if (!this.states.has(name)) this.states.set(name, {});
      applyProp(this.element, name, props[name], this.states.get(name));
    }
    if (children) render(this.element, children, { effect: this.child.context.effect });
  }

  dispose () { this.child.dispose(); }
}

// :::::: TEMPLATE INSTANCE

export class TemplateInstance {
  constructor (program, context, svg = false) {
    const { parts, template } = compile(program, svg);
    this.program  = program;
    this.fragment = document.importNode(template.content, true);

    // every node is found before anything is inserted: the paths are child indices of the clone
    const nodes = parts.map(({ path }) => path.reduce((node, index) => node.childNodes[index], this.fragment));

    this.parts = parts.map((desc, index) => {
      const node = nodes[index];
      if (desc.kind === 'child') return new HolePart(new ChildPart(node.previousSibling, node, context), desc.hole);
      if (desc.kind === 'node')  return new NodePart(node.previousSibling, node, desc, context);
      if (desc.kind === 'prop')  return new PropPart(node, desc, context);
      if (desc.kind === 'spread') return new SpreadPart(node, desc);
      return new MergedPart(node, desc, context);
    });
  }

  update (values) { for (const part of this.parts) part.update(values); }

  dispose () { for (const part of this.parts) part.dispose(); }
}

class HolePart {
  constructor (child, hole) { this.child = child; this.hole = hole; }
  update (values) { this.child.commit(values[this.hole]); }
  dispose () { this.child.dispose(); }
}

// :::::: RENDER

const roots = new WeakMap;   // target -> its root child part

export function render (target, value, options = {}) {
  let root = roots.get(target);
  if (!root) {
    const start = document.createComment('');
    const end   = document.createComment('');
    target.replaceChildren(start, end);
    root = new ChildPart(start, end, { effect: null });
    roots.set(target, root);
  }
  root.context.effect = options.effect ?? defaults.effect ?? null;
  root.commit(value);
  return root;
}

// takes back what render() put into the target, disposing its effects
export function unrender (target) {
  roots.get(target)?.remove();
  roots.delete(target);
}

export const defaults = { effect: null };
