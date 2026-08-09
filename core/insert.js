// @domina/core/insert.js

import { _el } from './internal/resolve.js';
import { isString } from './internal/is.js';
import { flatNodes } from './internal/normalize.js';
import { createElement } from './element.js';

// Alle Insert-Funktionen nehmen das Subjekt zuerst und geben es zurück,
// damit sich Aufrufe verketten lassen.
export const

appendTo  = (spec, target) => moveTo(spec, target, 'append'),
prependTo = (spec, target) => moveTo(spec, target, 'prepend'),

insertBefore = (spec, target) => moveTo(spec, target, 'before'),
insertAfter  = (spec, target) => moveTo(spec, target, 'after'),

// position: 'append' | 'prepend' | 'before' | 'after'
moveTo = (spec, target, position = 'append') => {
  const element = _el(spec), destination = _el(target);
  if (!element || !destination) return null;

  if      (position === 'prepend') destination.prepend(element);
  else if (position === 'before')  destination.before(element);
  else if (position === 'after')   destination.after(element);
  else                             destination.append(element);

  return element;
},

// Negativer Index zählt von hinten: -1 = vor dem letzten Kind, 0 = ganz vorne
insertAt = (target, index, ...nodes) => {
  const element = _el(target);
  if (!element) return null;

  const kids = flatNodes(nodes);
  if (!kids.length) return element;

  const children = element.children;
  const at  = index < 0 ? children.length + index : index;
  const ref = children[Math.max(0, Math.min(at, children.length))] ?? null;

  ref ? ref.before(...kids) : element.append(...kids);
  return element;
},

// wrap(el, 'div') oder wrap(el, existingNode) oder wrap(el, 'div', { class: 'box' })
wrap = (spec, wrapper = 'div', props = {}) => {
  const element = _el(spec);
  if (!element?.parentNode) return null;

  const box = isString(wrapper) ? createElement(wrapper, props) : _el(wrapper);
  if (!box) return null;

  element.replaceWith(box);   // Platz merken …
  box.append(element);        // … und Element reinziehen
  return box;
},

// Hülle weg, Kinder bleiben. Gibt die befreiten Nodes zurück.
unwrap = spec => {
  const element = _el(spec);
  if (!element?.parentNode) return null;

  const kids = [...element.childNodes];
  element.replaceWith(...kids);
  return kids;
},

// Ersetzt das Element durch die übergebenen Nodes. Gibt die neuen Nodes zurück.
replaceElement = (spec, ...nodes) => {
  const element = _el(spec);
  if (!element?.parentNode) return null;

  const kids = flatNodes(nodes);
  element.replaceWith(...kids);
  return kids;
},

removeElement = (...specs) => {
  const removed = [];
  for (const spec of specs.flat(Infinity)) {
    const element = _el(spec);
    if (element) { element.remove(); removed.push(element); }
  }
  return removed;
};
