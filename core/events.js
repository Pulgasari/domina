// events.js

import { _el, _tgt }   from './internal/resolve.js';
import { isArray, isFn, isString } from './internal/is.js';
import { arrayfied }   from './internal/normalize.js';
import { getElements } from './element.js';

const isIterable = v => !isString(v) && isFn(v?.[Symbol.iterator]);

// Events, die nicht bubbeln -> auf bubbelndes Äquivalent mappen
const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };

// 'click keydown' oder ['click','keydown'] -> ['click','keydown']
const typesOf = types => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);

/*
// Targets: Selektor (alle Treffer), Node, Array von beidem, window/document
const targetsOf = targets =>
  arrayfied(targets).flatMap(t =>
      t === window || t?.nodeType ? [t]
    : isString(t)                 ? getElements(t)
    : [_el(t)].filter(Boolean));
*/

const targetsOf = targets => {
  return arrayfied (isIterable(targets) ? [...targets] : targets).flatMap(t =>
      !t            ? []
    : isString(t)   ? getElements(t)
    : isFn(t.addEventListener) ? [t]
    : isIterable(t) ? targetsOf(t)
    : [_el(t)].filter(Boolean));
};


export const

/**
 * on(targets, types, handler, options?) -> off()
 * on('.btn', 'click keydown', fn)
 * on([el1, el2], ['pointerdown'], fn, { passive: true })
 */
onEvent = (targets, types, handler, options) => {
  const nodes = targetsOf(targets);
  const list  = typesOf(types);
  if (!nodes.length || !list.length || !isFn(handler)) return () => {};

  for (const node of nodes)
    for (const type of list)
      node.addEventListener(BUBBLE_MAP[type] ?? type, handler, options);

  return () => off(nodes, list, handler, options);
},

/** Feuert genau einmal – über alle targets/types hinweg, nicht pro Paar. */
onceEvent = (targets, types, handler, options) => {
  let stop;
  const wrapped = e => { stop(); handler(e); };
  stop = onEvent(targets, types, wrapped, options);
  return stop;
},

/** Spiegel zu on(). Options müssen zum Registrieren passen (capture!). */
offEvent = (targets, types, handler, options) => {
  for (const node of targetsOf(targets))
    for (const type of typesOf(types))
      node.removeEventListener(BUBBLE_MAP[type] ?? type, handler, options);
},

/**
 * emit(target, type, detail?, options?) -> boolean (false = preventDefault)
 * emit(el, 'domina:ready', { id: 5 })
 */
emitEvent = (target, type, detail = null, { bubbles = true, cancelable = true, composed = false } = {}) => {
  const el = _tgt(target);
  return el ? el.dispatchEvent(new CustomEvent(type, { detail, bubbles, cancelable, composed })) : false;
},

/** Wie on(), aber der Handler bekommt e.detail statt dem Event. */
onCustom = (targets, types, handler, options) =>
  onEvent(targets, types, e => handler(e.detail, e), options),

/** Wartet auf das nächste Vorkommen. -> Promise<Event> */
waitFor = (target, type, { signal, timeout } = {}) => new Promise((resolve, reject) => {
  const stop = once(target, type, e => { clearTimeout(timer); resolve(e); });
  const timer = timeout ? setTimeout(() => { stop(); reject(new Error(`waitFor: ${type} timed out`)); }, timeout) : null;
  signal?.addEventListener('abort', () => { stop(); clearTimeout(timer); reject(signal.reason); });
}),

delegate = (container, types, selector, fn, options) => {
  const $c   = _el(container);
  const list = typesOf(types);
  if (!$c || !list.length || !isFn(fn)) return () => {};

  const handler = e => {
    const match = e.target?.closest?.(selector);
    if (match && $c.contains(match)) fn.call(match, e, match);
  };

  const real = list.map(t => BUBBLE_MAP[t] ?? t);
  for (const type of real) $c.addEventListener(type, handler, options);
  return () => { for (const type of real) $c.removeEventListener(type, handler, options); };
},

onOutside = (spec, fn, { events = ['pointerdown'], escape = true, root = document } = {}) => {
  const el = _el(spec);
  if (!el) return () => {};

  let armed = false;
  requestAnimationFrame(() => { armed = true; });

  const onEvent = e => {
    if (!armed) return;
    const path = e.composedPath?.() ?? [];
    if (path.includes(el) || el.contains(e.target)) return;
    fn(e, el);
  };

  const onKey = e => { if (e.key === 'Escape') fn(e, el); };

  events.forEach(t => root.addEventListener(t, onEvent, true));
  if (escape) root.addEventListener('keydown', onKey);

  return () => {
    events.forEach(t => root.removeEventListener(t, onEvent, true));
    if (escape) root.removeEventListener('keydown', onKey);
  };
};
