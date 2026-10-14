// @domina/render/compile.js
// a program (a template with numbered holes) becomes a <template> and a list of
// part descriptors, once per program and namespace. the template is built in its
// own inert document, so no custom element constructor runs for the master copy;
// every instance is imported from it, which is when custom elements upgrade.

export const SVG_NS = 'http://www.w3.org/2000/svg';

const compiled = { html: new WeakMap, svg: new WeakMap };

const isClassKey = key => key === 'class' || key === 'className' || (typeof key === 'string' && key.startsWith('class:'));
const isStyleKey = key => key === 'style' || (typeof key === 'string' && key.startsWith('style:'));

export const isHole  = value => value !== null && typeof value === 'object' && 'hole' in value;
export const isParts = value => value !== null && typeof value === 'object' && Array.isArray(value.parts);
const isDynamic      = value => isHole(value) || isParts(value);
const isPrimitive    = value => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

// a class list as html writes it, from the static entries alone
export function joinClasses (entries, read = value => value) {
  const names = [];
  const add = value => {
    if (!value) return;
    if (typeof value === 'string') names.push(...value.split(/\s+/).filter(Boolean));
    else if (Array.isArray(value)) value.forEach(add);
    else if (typeof value === 'object') for (const name in value) if (value[name]) names.push(name);
  };
  for (const [key, value] of entries) {
    const resolved = read(value);
    if (typeof key === 'string' && key.startsWith('class:')) { if (resolved) names.push(key.slice(6)); }
    else add(resolved);
  }
  return [...new Set(names)].join(' ');
}

export function compile (program, svg = false) {
  const cache = svg ? compiled.svg : compiled.html;
  let result  = cache.get(program);
  if (result) return result;

  const template = document.createElement('template');
  const doc      = template.content.ownerDocument;
  const parts    = [];

  // a child hole is a pair of comments: content goes between them
  const marker = (parent, path, part) => {
    parent.append(doc.createComment(''), doc.createComment(''));
    parts.push({ ...part, path: [...path, parent.childNodes.length - 1] });
  };

  function element (node, parent, path, inSvg) {
    const svgHere = inSvg || node.tag === 'svg';
    const created = svgHere ? doc.createElementNS(SVG_NS, node.tag) : doc.createElement(node.tag);
    parent.append(created);
    const here = [...path, parent.childNodes.length - 1];

    const classes = [];
    const own     = [];   // the element's own parts, queued after its children's
    const styles  = [];

    for (const prop of node.props) {
      // class and style of a spread add up with the element's own, in source order
      if (!Array.isArray(prop)) {
        own.push({ hole: prop.spread, kind: 'spread', path: here });
        classes.push(['...', prop]);
        styles.push(['...', prop]);
        continue;
      }
      const [name, value] = prop;
      if (isClassKey(name)) { classes.push([name, value]); continue; }
      if (isStyleKey(name)) { styles.push([name, value]); continue; }
      if (isDynamic(value) || !isPrimitive(value) || name === 'ref' || name === '!html') { own.push({ kind: 'prop', name, path: here, value }); continue; }
      if (value === false || name === 'key') continue;
      created.setAttribute(name, value === true ? '' : String(value));
    }

    if (classes.length) {
      if (classes.some(([name, value]) => isDynamic(value) || name === '...')) own.push({ entries: classes, kind: 'class', path: here });
      else { const text = joinClasses(classes); if (text) created.setAttribute('class', text); }
    }
    if (styles.length) own.push({ entries: styles, kind: 'style', path: here });

    // children update first: a <select> has its options before its value, a ref sees the content
    children(node.children, created, here, svgHere && node.tag !== 'foreignObject');
    parts.push(...own);
  }

  function children (nodes, parent, path, inSvg) {
    for (const node of nodes) {
      if (typeof node === 'string') parent.append(doc.createTextNode(node));
      else if (isHole(node))        marker(parent, path, { hole: node.hole, kind: 'child' });
      else if (typeof node.tag !== 'string') marker(parent, path, { kind: 'node', node: { ...node, program: { nodes: node.children } }, svg: inSvg });
      else element(node, parent, path, inSvg);
    }
  }

  children(program.nodes, template.content, [], svg);

  result = { parts, template };
  cache.set(program, result);
  return result;
}

export default compile;
