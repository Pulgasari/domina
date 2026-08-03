// @domina/core/collection/shared.js

import { getElements } from '../query.js';
import { isArray, isFn, isString } from '../internal/is.js';
import { _el } from '../internal/resolve.js';

/**
 * Container auflösen + Items einsammeln.
 * -> { $container, items } | null   (null = Container nicht gefunden)
 */
export const resolveScope = (name, container, item) => {
  const $container = _el(container);
  if (!$container) {
    console.warn(`${name}: container not found.`, container);
    return null;
  }
  return { $container, items: getElements(item, $container) };
};

/**
 * Spec-Liste normalisieren. Akzeptiert einen einzelnen Spec oder ein Array davon.
 * Jede Form (String | Fn | Array | Objekt) wird über `shape` in ein Objekt gebracht.
 */
export const toSpecs = (input, shape) => [].concat(input ?? []).map(shape);

// Die Shapes selbst — pro Modul einer, aber hier beisammen,
// damit die Konventionen sichtbar nebeneinander stehen.

export const sortShape = defaults => spec => {
  if (isFn(spec))     return { selector: null,    order: spec };
  if (isString(spec)) return { selector: spec,    order: defaults };
  if (isArray(spec))  return { selector: spec[0], order: spec[1] || defaults };
  return { order: defaults, ...spec };
};

export const filterShape = spec => {
  if (isFn(spec))    return { customFn: spec };
  if (isArray(spec)) return { selector: spec[0], value: spec[1], mode: spec[2] || 'contains' };
  return { mode: 'contains', ...spec };
};
