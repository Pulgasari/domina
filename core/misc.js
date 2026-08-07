// misc.js

import { _el } from './internal/resolve.js';
import { isString } from './internal/is.js';
import { flatNodes } from './internal/normalize.js';
import { createElement } from './element.js';

export const

// wrap(el, 'div') oder wrap(el, existingNode) oder wrap(el, 'div', { class: 'box' })
wrap = (spec, wrapper = 'div', props = {}) => {
  const el = _el(spec);
  if (!el?.parentNode) return null;

  const w = isString(wrapper) ? createElement(wrapper, props) : _el(wrapper);
  if (!w) return null;

  el.replaceWith(w);   // Platz merken …
  w.append(el);        // … und Element reinziehen
  return w;
},

// Hülle weg, Kinder bleiben. Gibt die befreiten Nodes zurück.
unwrap = spec => {
  const el = _el(spec);
  if (!el?.parentNode) return null;

  const kids = [...el.childNodes];
  el.replaceWith(...kids);
  return kids;
},

// Negativer Index zählt von hinten: -1 = vor dem letzten Kind, 0 = ganz vorne
insertAt = (target, index, ...nodes) => {
  const el = _el(target);
  if (!el) return null;

  const kids = flatNodes(nodes);
  if (!kids.length) return el;

  const children = el.children;
  const i   = index < 0 ? children.length + index : index;
  const ref = children[Math.max(0, Math.min(i, children.length))] ?? null;

  ref ? ref.before(...kids) : el.append(...kids);
  return el;
},

// position: 'append' | 'prepend' | 'before' | 'after'
moveTo = (spec, target, position = 'append') => {
  const el = _el(spec), t = _el(target);
  if (!el || !t) return null;

  if      (position === 'prepend') t.prepend(el);
  else if (position === 'before')  t.before(el);
  else if (position === 'after')   t.after(el);
  else                             t.append(el);

  return el;
};
