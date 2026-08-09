// @domina/core/traverse.js

import { _el, _slct } from './internal/resolve.js';
import { getElement, getElements } from './query.js';

// Jede Funktion nimmt einen optionalen Filter-Selektor. Ungefiltert ist der
// seltenere Fall – getParents(el, '.card') ist das, was man wirklich braucht.
const passes = (element, filter) => !filter || element.matches(_slct(filter));

const walk = (element, direction, filter, all) => {
  const found = [];
  let current = element?.[direction];

  while (current) {
    if (passes(current, filter)) {
      found.push(current);
      if (!all) break;
    }
    current = current[direction];
  }
  return found;
};

export const

getParent = (spec, filter) => {
  const parent = _el(spec)?.parentElement ?? null;
  return parent && passes(parent, filter) ? parent : null;
},

// Aufsteigend bis zur Wurzel, nächster Vorfahre zuerst
getParents = (spec, filter) => walk(_el(spec), 'parentElement', filter, true),

getClosest = (spec, selector) => _el(spec)?.closest(_slct(selector)) ?? null,

getChildren = (spec, filter) => {
  const element = _el(spec);
  if (!element) return [];
  return [...element.children].filter(child => passes(child, filter));
},

getSiblings = (spec, filter) => {
  const element = _el(spec);
  if (!element?.parentElement) return [];
  return [...element.parentElement.children].filter(child => child !== element && passes(child, filter));
},

getNext    = (spec, filter) => walk(_el(spec), 'nextElementSibling',     filter, false)[0] ?? null,
getPrev    = (spec, filter) => walk(_el(spec), 'previousElementSibling', filter, false)[0] ?? null,
getNextAll = (spec, filter) => walk(_el(spec), 'nextElementSibling',     filter, true),
getPrevAll = (spec, filter) => walk(_el(spec), 'previousElementSibling', filter, true),

getFirst = (spec, ctx) => getElement(spec, ctx),
getLast  = (spec, ctx) => getElements(spec, ctx).at(-1) ?? null,

// Position unter den Geschwistern, -1 wenn es das Element nicht gibt
getIndex = spec => {
  const element = _el(spec);
  if (!element?.parentElement) return -1;
  return [...element.parentElement.children].indexOf(element);
},

containsElement = (spec, other) => {
  const element = _el(spec), target = _el(other);
  return !!element && !!target && element !== target && element.contains(target);
},

matchesElement = (spec, selector) => _el(spec)?.matches(_slct(selector)) ?? false;
