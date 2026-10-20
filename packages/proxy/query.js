// @domina/proxy/query.js
// elements as a list whose tests take a function, a selector or a matcher object

/*
  domina.getElements('.card')                  a List of the elements, in document order
  list.find({ active: true })                  every key has to match
  list.filter('[open]')                        a selector, element.matches()
  list.find(element => element.dataset.id)     a function, as on an array

a matcher key reads the element's property when the element has one
(active, name, localName), else its attribute: true means present, false
absent, anything else is compared as a string.
*/

const valueOf = (element, key) => key in element ? element[key] : element.getAttribute(key);

function matchesValue (element, key, expected) {
  if (!(key in element) && (expected === true || expected === false)) return element.hasAttribute(key) === expected;
  const value = valueOf(element, key);
  return key in element ? Object.is(value, expected) : value === String(expected);
}

// a test for any of the three forms
export function matcherOf (test) {
  if (typeof test === 'function') return test;
  if (typeof test === 'string')   return element => element.matches?.(test) ?? false;
  const entries = Object.entries(test ?? {});
  return element => entries.every(([key, expected]) => matchesValue(element, key, expected));
}

export class List extends Array {
  every     (test, self) { return super.every     (matcherOf(test), self); }
  filter    (test, self) { return super.filter    (matcherOf(test), self); }
  find      (test, self) { return super.find      (matcherOf(test), self); }
  findIndex (test, self) { return super.findIndex (matcherOf(test), self); }
  findLast  (test, self) { return super.findLast  (matcherOf(test), self); }
  some      (test, self) { return super.some      (matcherOf(test), self); }
}
