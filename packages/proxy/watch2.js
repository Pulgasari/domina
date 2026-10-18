// @domina/proxy/watch.js
// point-free inspired

import { plainOf } from './facade.js';
import { toKebabCase } from './shared.js';

// :::::: LOW-LEVEL OBSERVER PRIMITIVES

const combine = (...stops) => () => stops.forEach(s => s?.());

const mutations = (target, opts, notify) => {
  if (!target) return () => {};
  const obs = new MutationObserver(notify);
  obs.observe(target, opts);
  return () => obs.disconnect();
};

const events = (target, types, notify) => {
  types.forEach(t => target?.addEventListener(t, notify, { passive: true }));
  return () => types.forEach(t => target?.removeEventListener(t, notify));
};

const media = (query, notify) => {
  const m = globalThis.matchMedia?.(query);
  m?.addEventListener('change', notify);
  return () => m?.removeEventListener('change', notify);
};

const view  = ctx => ctx.document.defaultView ?? globalThis;
const attrs = (filter, { host }, notify) => mutations(host, filter ? { attributeFilter: filter } : { attributes: true }, notify);
const head  = ({ document }, notify)     => mutations(document.head, { attributes: true, characterData: true, childList: true, subtree: true }, notify);

// :::::: SOURCE MAKERS

const onAttr      = (p = '')             => (ctx, key, notify) => attrs(key ? [`${p}${toKebabCase(key)}`] : null, ctx, notify);
const onFixedAttr = attr                 => (ctx, _,   notify) => attrs([attr], ctx, notify);
const onEvt       = (targetFn, ...types) => (ctx, _,   notify) => events(targetFn(ctx), types, notify);

const SOURCES = {
  attr    : onAttr(),
  class   : onFixedAttr('class'),
  data    : onAttr('data-'),
  dir     : onFixedAttr('dir'),
  lang    : onFixedAttr('lang'),
  vars    : onFixedAttr('style'),

  meta    : head,
  title   : head,
  scheme  : (ctx, key, notify) => combine(head(ctx, notify), attrs(['style'], ctx, notify)),

  focus   : onEvt(ctx => ctx.document, 'focusin', 'focusout'),
  focused : onEvt(view, 'focus', 'blur'),
  motion  : (ctx, _, notify) => media('(prefers-reduced-motion: reduce)', notify),
  online  : onEvt(view, 'online', 'offline'),
  scroll  : onEvt(ctx => ctx.isDocument ? view(ctx) : ctx.host, 'scroll'),
  url     : onEvt(view, 'hashchange', 'popstate'),
  visible : onEvt(ctx => ctx.document, 'visibilitychange'),
};

// :::::: COMPARISON & WATCH PIPELINE

const isObj = x => x && typeof x === 'object' && !(x instanceof Node);
const same = (a, b) => Object.is(a, b) || (isObj(a) && isObj(b) && JSON.stringify(a) === JSON.stringify(b));

function watch (ctx, path, callback) {
  if (typeof callback !== 'function') throw new TypeError('[domina] watch(): the callback is not a function');

  const [name, ...rest] = String(path).split('.');
  const key = rest.join('.') || null;
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

export { watch, watchable };
