// @domina/core/class.js

import { _el } from './internal/resolve.js';
import { isObject } from './internal/is.js';
import { toList } from './internal/normalize.js';

// Alle Schreibfunktionen nehmen String, Array und Objekt:
//   'a b'                 ['a', ['b']]                { a: true, b: false }
// Das Objekt-Form ist der Grund, warum man classList nicht direkt nimmt.
export const

// getClass(spec)      -> ['a', 'b']
// getClass(spec, 'a') -> boolean   (Kurzform von hasClass)
getClass = (spec, name) => {
  const element = _el(spec);
  if (!element) return name ? false : [];
  return name ? element.classList.contains(name) : [...element.classList];
},

hasClass = (spec, names) => {
  const element = _el(spec);
  if (!element) return false;
  const list = toList(names);
  return list.length > 0 && list.every(name => element.classList.contains(name));
},

// Ersetzt das gesamte class-Attribut
setClass = (spec, names) => {
  const element = _el(spec);
  if (!element) return null;
  element.setAttribute('class', toList(names).join(' '));
  return element;
},

addClass = (spec, ...names) => {
  const element = _el(spec);
  if (!element) return null;
  const list = toList(names);
  if (list.length) element.classList.add(...list);
  return element;
},

removeClass = (spec, ...names) => {
  const element = _el(spec);
  if (!element) return null;
  const list = toList(names);
  if (list.length) element.classList.remove(...list);
  return element;
},

/**
 * toggleClass(spec, 'active')              -> umschalten
 * toggleClass(spec, 'active', true)        -> erzwingen
 * toggleClass(spec, { active: isOpen })    -> pro Klasse erzwingen, force entfällt
 */
toggleClass = (spec, names, force) => {
  const element = _el(spec);
  if (!element) return null;

  if (isObject(names)) {
    for (const [name, on] of Object.entries(names)) element.classList.toggle(name, Boolean(on));
    return element;
  }

  for (const name of toList(names)) element.classList.toggle(name, force);
  return element;
},

replaceClass = (spec, from, to) => {
  const element = _el(spec);
  if (!element) return null;
  // classList.replace() tauscht nur, wenn `from` vorhanden ist – hier soll `to` immer landen
  element.classList.remove(...toList(from));
  element.classList.add(...toList(to));
  return element;
};
