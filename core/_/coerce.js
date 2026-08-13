// @domina/core/internal/coerce.js

import { isNumber, isString } from './is.js';

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
