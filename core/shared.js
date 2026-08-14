// @domina/core/shared.js
//
// Die geteilte Infrastruktur von core: Vendor-Re-Exports, Coercion, Listen-
// Normalisierung, Traversal- und Collection-Helfer. Alles, was mehr als eine
// Methode braucht, aber selbst keine Methode ist.

import { buildSelector }  from './methods/buildSelector.js';
import { getElements }    from './methods/getElements.js';
import { resolveElement } from './methods/resolveElement.js';
import { isArray, isFn, isNullish, isNumber, isObject, isString } from 'https://code.pulgasari.dev/js/is.js';

/*
  Zyklus mit Ansage: buildSelector holt sich isObject/isString/toKebabCase von
  hier zurück. Unkritisch, weil buildSelector eine gehoistete function-Deklaration
  ist und alle Bindings erst zur Aufrufzeit gelesen werden, nie während der
  Modulauswertung.
*/

// :::::: VENDOR

export * from 'https://code.pulgasari.dev/js/is.js';
export * from 'https://code.pulgasari.dev/js/logger.js';
export * from 'https://code.pulgasari.dev/js/str.js';

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

// :::::: COERCION

const pad = n => String(n).padStart(2, '0');

export const toNum = v => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// Reine Zahlen gelten NICHT als Datum, sonst wird aus "2020" ein Jahr
// und aus "5" der 5. Januar 2001.
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

export const startOfDay  = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const toDateInput = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Attribut-Strings sind immer Strings. 'false' ist deshalb truthy, was fast nie
// gemeint ist – nur die leere Zeichenkette (Attribut ohne Wert) zaehlt als true.
export const toBool = v => {
  if (typeof v === 'boolean') return v;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === '' || s === 'true' || s === '1' || s === 'yes' || s === 'on';
};

// Zahl -> '12px', String bleibt unangetastet ('50%', 'auto', 'calc(...)')
export const toPx = v => isNumber(v) ? `${v}px` : String(v ?? '');

export const fromPx = v => isNumber(v) ? v : (toNum(String(v ?? '').replace(/px$/i, '')) ?? 0);

// data-count="0" soll 0 sein, nicht "0". Reihenfolge: leer -> bool -> zahl -> json -> string
export const autoCast = v => {
  if (!isString(v)) return v;

  const s = v.trim();
  if (s === '')      return '';
  if (s === 'true')  return true;
  if (s === 'false') return false;
  if (s === 'null')  return null;

  // fuehrende Nullen und '+' bleiben Strings ('007' ist eine Kennung, keine 7)
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
 * Token-Listen überall gleich. Akzeptiert
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

// Jede Funktion nimmt einen optionalen Filter-Selektor. Ungefiltert ist der
// seltenere Fall – getParents(el, '.card') ist das, was man wirklich braucht.
export const passes = (element, filter) => !filter || element.matches(buildSelector(filter));

export const walk = (element, direction, filter, all) => {
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

// :::::: COLLECTION  (von filterElements, sortElements, groupElements)

/**
 * Container auflösen + Items einsammeln.
 * -> { $container, items } | null   (null = Container nicht gefunden)
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
 * Spec-Liste normalisieren. Akzeptiert einen einzelnen Spec oder ein Array davon.
 * Jede Form (String | Fn | Array | Objekt) wird über `shape` in ein Objekt gebracht.
 */
export const toSpecs = (input, shape) => [].concat(input ?? []).map(shape);

// Die Shapes selbst — pro Modul einer, aber hier beisammen,
// damit die Konventionen sichtbar nebeneinander stehen.

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
