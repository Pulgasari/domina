// @domina/proxy/watch.js
// watch('data.theme', (value, old) => …) -> stop. a path is a member or a space, optionally a key in it.
// each source listens as narrowly as it can, the callback only runs when the value really changed

// :::::: IMPORT

import domina from '@domina/domina';
import { plainOf } from './facade.js';
import { toKebabCase } from './shared.js';

//const toKebabCase = name => name.replace(/[A-Z]/g, char => '-' + char.toLowerCase());

function mutations (target, options, notify) {
  if (!target) return () => {};
  const observer = new MutationObserver(notify);
  observer.observe(target, options);
  return () => observer.disconnect();
}

function events (target, types, notify) {
  for (const type of types) target.addEventListener(type, notify, { passive: true });
  return () => { for (const type of types) target.removeEventListener(type, notify); };
}

const
onEvents        = (types, handler, options) => domina.onEvents(types, handler, options)
onPassiveEvents = (types, handler)          => onEvents(types, handler, { passive: true });

function media (query, notify) {
  const list = globalThis.matchMedia?.(query);
  list?.addEventListener('change', notify);
  return () => list?.removeEventListener('change', notify);
}

const attributes = (filter, { host }, notify) => mutations(host, filter ? { attributeFilter: filter } : { attributes: true }, notify);
const inHead     = ({ document }, notify)     => mutations(document.head, { attributes: true, characterData: true, childList: true, subtree: true }, notify);
const view       = ({ document })             => document.defaultView ?? globalThis;

const byAttribute = (str) => {
  return function (ctx, key, notify) {
    attributes(['dir'], ctx, notify);
  }
}

// name -> (ctx, key, notify) => stop
const SOURCES = {
  attr    : (ctx, key, notify) => attributes(key ? [toKebabCase(key)] : null, ctx, notify),
  data    : (ctx, key, notify) => attributes(key ? [`data-${toKebabCase(key)}`] : null, ctx, notify),
  
  class   : (ctx, key, notify) => attributes(['class'], ctx, notify),
  dir     : (ctx, key, notify) => attributes(['dir'], ctx, notify),
  lang    : (ctx, key, notify) => attributes(['lang'], ctx, notify),
  vars    : (ctx, key, notify) => attributes(['style'], ctx, notify),

  class : byAttribute('class'),
  dir   : byAttribute('dir'),
  lang  : byAttribute('lang'),
  vars  : byAttribute('vars'),


  meta    : (ctx, key, notify) => inHead(ctx, notify),
  title   : (ctx, key, notify) => inHead(ctx, notify),
  scheme  : (ctx, key, notify) => { const stops = [inHead(ctx, notify), attributes(['style'], ctx, notify)]; return () => stops.forEach(stop => stop()); },

  
  focused : (ctx, key, notify) => events(view(ctx), ['focus', 'blur'],          notify),
  online  : (ctx, key, notify) => events(view(ctx), ['online', 'offline'],      notify),
  url     : (ctx, key, notify) => events(view(ctx), ['hashchange', 'popstate'], notify),
  
  motion  : (ctx, key, notify) => media('(prefers-reduced-motion: reduce)', notify),
  
  scroll  : (ctx, key, notify) => events(ctx.isDocument ? view(ctx) : ctx.host, ['scroll'], notify),
  
  focus   : (ctx, key, notify) => events(ctx.document, ['focusin', 'focusout'], notify),
  visible : (ctx, key, notify) => events(ctx.document, ['visibilitychange'],    notify),
};

// nodes by identity, everything else by its json form
const same = (a, b) =>
  Object.is(a, b) || (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' &&
    !(a instanceof Node) && !(b instanceof Node) && JSON.stringify(a) === JSON.stringify(b));

function watch (ctx, path, callback) {
  if (typeof callback !== 'function') throw new TypeError('[domina] watch(): the callback is not a function');

  const [name, ...rest] = String(path).split('.');
  const key    = rest.join('.') || null;
  const source = SOURCES[name];
  if (!source || !(name in ctx.facade)) throw new TypeError(`[domina] watch(): "${path}" cannot be watched here`);

  const read = () => key ? ctx.facade[name][key] : plainOf(ctx.facade, name);
  let current = read();

  return source(ctx, key, () => {
    const next = read();
    if (same(next, current)) return;
    const old = current;
    current = next;
    callback(next, old);
  });
}

const watchable = Object.keys(SOURCES);

// :::::: EXPORT

export { watch, watchable };
