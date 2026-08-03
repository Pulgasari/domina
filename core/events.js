// events.js

import { _el } from './internal/resolve.js';

// Events, die nicht bubbeln -> auf bubbelndes Äquivalent mappen
const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };

export const

delegate = (container, type, selector, fn, opts = {}) => {
  const $c = _el(container);
  if (!$c) return () => {};

  const real = BUBBLE_MAP[type] ?? type;

  const handler = e => {
    const match = e.target?.closest?.(selector);
    if (match && $c.contains(match)) fn.call(match, e, match);
  };

  $c.addEventListener(real, handler, opts);
  return () => $c.removeEventListener(real, handler, opts);
},

onOutside = (spec, fn, { events = ['pointerdown'], escape = true, root = document } = {}) => {
  const el = _el(spec);
  if (!el) return () => {};

  // Verhindert, dass der Klick, der das Element gerade geöffnet hat,
  // es sofort wieder schließt
  let armed = false;
  requestAnimationFrame(() => { armed = true; });

  const onEvent = e => {
    if (!armed) return;
    const path = e.composedPath?.() ?? [];
    if (path.includes(el) || el.contains(e.target)) return;
    fn(e, el);
  };

  const onKey = e => { if (e.key === 'Escape') fn(e, el); };

  events.forEach(t => root.addEventListener(t, onEvent, true));
  if (escape) root.addEventListener('keydown', onKey);

  return () => {
    events.forEach(t => root.removeEventListener(t, onEvent, true));
    if (escape) root.removeEventListener('keydown', onKey);
  };
};
