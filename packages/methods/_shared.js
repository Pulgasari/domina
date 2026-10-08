// @domina/methods/_shared.js

import buildSelector  from './buildSelector.js';
import getElements    from './getElements.js';
import resolveElement from './resolveElement.js';
import { isArray, isFn, isIterable, isNullish, isObject, isString } from '@pulgasari/is';

// :::::: VENDOR (only the symbols the methods consume)

export {
  isArray, isCheckable, isElementish, isEmpty, isFn, isIterable,
  isMultiSelect, isNumber, isObject, isString, isWindow,
} from '@pulgasari/is';
export { toCamelCase, toKebabCase } from '@pulgasari/str';

// :::::: GENERISCH

export const
arrayfied = v => isNullish(v) ? [] : isArray(v) ? v : [v],
shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// :::::: EVENTS

// non-bubbling events -> their bubbling equivalent
export const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };

export const eventTypes = types => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);

// an event target is taken as it is BEFORE anything is iterated: a <form> or a
// <select> is iterable (over its controls / options) but is itself the target
export const eventTargets = targets => {
  if (!targets) return [];
  if (isString(targets))              return getElements(targets);
  if (isFn(targets.addEventListener)) return [targets];
  if (isIterable(targets))            return [...targets].flatMap(eventTargets);
  return [resolveElement(targets)].filter(Boolean);
};

// :::::: COERCION

const pad = n => String(n).padStart(2, '0');

export const
startOfDay  = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()),
toDateInput = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;


export const toNum = v => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// a bare number is NOT a date, else "2020" becomes a year and "5" the 5th of
// january 2001
export const parseDate = v => {
  if (v instanceof Date) return Number.isNaN(+v) ? null : v;
  const s = String(v ?? '').trim();
  if (!s || !Number.isNaN(Number(s))) return null;

  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);   // dd.mm.yyyy
  if (m) {
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    return Number.isNaN(+d) ? null : d;
  }

  const d = new Date(s);
  return Number.isNaN(+d) ? null : d;
};

// data-count="0" is 0, not "0". order: empty -> bool -> number -> json -> string
export const autoCast = v => {
  if (!isString(v)) return v;

  const s = v.trim();
  if (s === '')      return '';
  if (s === 'true')  return true;
  if (s === 'false') return false;
  if (s === 'null')  return null;

  // leading zeros and '+' stay strings ('007' is an id, not a 7)
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/.test(s)) return Number(s);

  const first = s[0];
  if (first === '{' || first === '[' || first === '"') {
    try { return JSON.parse(s); } catch { return v; }
  }

  return v;
};

// :::::: LISTEN

export const
flatNodes = nodes => nodes.flat(Infinity).filter(n => n != null && n !== false),

/**
 * token lists the same everywhere. takes
 *   'a b, c'                 -> ['a', 'b', 'c']
 *   ['a', ['b', 'c']]        -> ['a', 'b', 'c']
 *   { a: true, b: 0, c: 1 }  -> ['a', 'c']
 */
toList = value => {
  if (isNullish (value) || value === false) return [];
  if (isString  (value)) return value.split(/[\s,]+/).filter(Boolean);
  if (isArray   (value)) return value.flat(Infinity).flatMap(toList);
  if (isObject  (value)) return Object.entries(value).filter(([, on]) => on).map(([name]) => name);
  return [String(value)];
};

// :::::: TRAVERSAL

// every traversal takes an optional filter, a selector or an element spec. the
// selector is built once per call, not once per element visited
export const matcher = filter => {
  if (!filter) return () => true;
  const selector = buildSelector(filter);
  return element => element.matches(selector);
};

export const passes = (element, filter) => matcher(filter)(element);

export const walk = (element, direction, filter, all) => {
  const test  = matcher(filter);
  const found = [];
  let current = element?.[direction];

  while (current) {
    if (test(current)) {
      found.push(current);
      if (!all) break;
    }
    current = current[direction];
  }
  return found;
};

// :::::: COLLECTION  (von filterElements, sortElements, groupElements)

/**
 * resolves the container and collects its items.
 * -> { $container, items } | null   (null = no container)
 */
export const resolveScope = (name, container, item) => {
  const $container = resolveElement(container);
  if (!$container) {
    console.warn(`${name}: container not found.`, container);
    return null;
  }
  return { $container, items: getElements(item, $container) };
};

/**
 * normalizes a spec list, a single spec or an array of them. every form (string |
 * fn | array | object) is brought into an object by `shape`.
 */
export const toSpecs = (input, shape) => [].concat(input ?? []).map(shape);

// the shapes themselves, one per module, kept together so the conventions
// stand side by side

export const sortShape = defaults => spec => {
  if (isFn     (spec)) return { selector: null,    order: spec };
  if (isString (spec)) return { selector: spec,    order: defaults };
  if (isArray  (spec)) return { selector: spec[0], order: spec[1] || defaults };
                       return { order: defaults, ...spec };
};

export const filterShape = spec => {
  if (isFn    (spec)) return { customFn: spec };
  if (isArray (spec)) return { selector: spec[0], value: spec[1], mode: spec[2] || 'contains' };
                      return { mode: 'contains', ...spec };
};
