// @domina/core/internal/coerce.js

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
