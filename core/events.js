// @domina/core/events.js

import { _el, _tgt } from './internal/resolve.js';
import { isFn, isString } from './internal/is.js';
import { arrayfied } from './internal/normalize.js';
import { getElements } from './query.js';

const isIterable = v => !isString(v) && isFn(v?.[Symbol.iterator]);

// Events, die nicht bubbeln -> auf bubbelndes Äquivalent mappen
const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };

// 'click keydown' oder ['click','keydown'] -> ['click','keydown']
const typesOf = types => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);

// Selektor (alle Treffer), Node, window/document, Iterables von all dem
const targetsOf = targets =>
  arrayfied(isIterable(targets) ? [...targets] : targets).flatMap(target =>
      !target                         ? []
    : isString(target)                ? getElements(target)
    : isFn(target.addEventListener)   ? [target]
    : isIterable(target)              ? targetsOf(target)
    : [_el(target)].filter(Boolean));

export const

/**
 * onEvent(targets, types, handler, options?) -> off()
 * onEvent('.btn', 'click keydown', fn)
 * onEvent([el1, el2], ['pointerdown'], fn, { passive: true })
 */
onEvent = (targets, types, handler, options) => {
  const nodes = targetsOf(targets);
  const list  = typesOf(types);
  if (!nodes.length || !list.length || !isFn(handler)) return () => {};

  for (const node of nodes)
    for (const type of list)
      node.addEventListener(BUBBLE_MAP[type] ?? type, handler, options);

  return () => offEvent(nodes, list, handler, options);
},

/** Feuert genau einmal – über alle targets/types hinweg, nicht pro Paar. */
onceEvent = (targets, types, handler, options) => {
  let stop;
  const wrapped = event => { stop(); handler(event); };
  stop = onEvent(targets, types, wrapped, options);
  return stop;
},

/** Spiegel zu onEvent(). Options müssen zum Registrieren passen (capture!). */
offEvent = (targets, types, handler, options) => {
  for (const node of targetsOf(targets))
    for (const type of typesOf(types))
      node.removeEventListener(BUBBLE_MAP[type] ?? type, handler, options);
},

/**
 * emitEvent(target, type, detail?, options?) -> boolean (false = preventDefault)
 * emitEvent(el, 'domina:ready', { id: 5 })
 */
emitEvent = (target, type, detail = null, { bubbles = true, cancelable = true, composed = false } = {}) => {
  const element = _tgt(target);
  return element ? element.dispatchEvent(new CustomEvent(type, { detail, bubbles, cancelable, composed })) : false;
},

/** Wie onEvent(), aber der Handler bekommt e.detail statt dem Event. */
onCustom = (targets, types, handler, options) =>
  onEvent(targets, types, event => handler(event.detail, event), options),

/** Wartet auf das nächste Vorkommen. -> Promise<Event> */
waitForEvent = (target, type, { signal, timeout } = {}) => new Promise((resolve, reject) => {
  const stop  = onceEvent(target, type, event => { clearTimeout(timer); resolve(event); });
  const timer = timeout ? setTimeout(() => { stop(); reject(new Error(`waitForEvent: ${type} timed out`)); }, timeout) : null;
  signal?.addEventListener('abort', () => { stop(); clearTimeout(timer); reject(signal.reason); });
}),

/** Ein Listener am Container, der nur für passende Nachfahren feuert. */
delegate = (container, types, selector, handler, options) => {
  const element = _el(container);
  const list    = typesOf(types).map(type => BUBBLE_MAP[type] ?? type);
  if (!element || !list.length || !isFn(handler)) return () => {};

  const listener = event => {
    const match = event.target?.closest?.(selector);
    if (match && element.contains(match)) handler.call(match, event, match);
  };

  for (const type of list) element.addEventListener(type, listener, options);
  return () => { for (const type of list) element.removeEventListener(type, listener, options); };
},

/** Klick/Tap ausserhalb des Elements – der Klassiker für Dropdowns und Dialoge. */
onOutside = (spec, handler, { events = ['pointerdown'], escape = true, root = document } = {}) => {
  const element = _el(spec);
  if (!element) return () => {};

  // erst ab dem naechsten Frame scharf, sonst schliesst der oeffnende Klick sofort wieder
  let armed = false;
  requestAnimationFrame(() => { armed = true; });

  const onPointer = event => {
    if (!armed) return;
    const path = event.composedPath?.() ?? [];
    if (path.includes(element) || element.contains(event.target)) return;
    handler(event, element);
  };

  const onKey = event => { if (event.key === 'Escape') handler(event, element); };

  events.forEach(type => root.addEventListener(type, onPointer, true));
  if (escape) root.addEventListener('keydown', onKey);

  return () => {
    events.forEach(type => root.removeEventListener(type, onPointer, true));
    if (escape) root.removeEventListener('keydown', onKey);
  };
};

export const waitFor = waitForEvent;
