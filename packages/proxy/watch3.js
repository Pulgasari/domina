// @domina/proxy/watch.js
// RxJS style

import { plainOf } from './facade.js';
import { toKebabCase } from './shared.js';

// :::::: UNIFORM OBSERVER PRIMITIVES

const observeMutation = (getTarget, getOptions) => (ctx, key, notify) => {
  const target = getTarget(ctx, key);
  if (!target) return () => {};
  const observer = new MutationObserver(notify);
  observer.observe(target, getOptions(ctx, key));
  return () => observer.disconnect();
};

const observeEvents = (getTarget, types) => (ctx, key, notify) => {
  const target = getTarget(ctx, key);
  types.forEach(type => target?.addEventListener(type, notify, { passive: true }));
  return () => types.forEach(type => target?.removeEventListener(type, notify));
};

const observeMedia = (query) => (_, __, notify) => {
  const list = globalThis.matchMedia?.(query);
  list?.addEventListener('change', notify);
  return () => list?.removeEventListener('change', notify);
};

// Teardown composition
const combine = (...sources) => (ctx, key, notify) => {
  const stops = sources.map(source => source(ctx, key, notify));
  return () => stops.forEach(stop => stop?.());
};

// :::::: DOM CONTEXT RESOLVERS

const view       = ctx => ctx.document.defaultView ?? globalThis;
const headTarget = ctx => ctx.document.head;

// :::::: REUSABLE ATTR & EVENT SOURCES

const attrFilter = (prefix = '') => (ctx, key) =>
  key ? { attributeFilter: [`${prefix}${toKebabCase(key)}`] } : { attributes: true };

const observeAttr        = attr   => observeMutation(ctx => ctx.host, () => ({ attributeFilter: [attr] }));
const observeDynamicAttr = prefix => observeMutation(ctx => ctx.host, attrFilter(prefix));

const headObserver = observeMutation(headTarget, () => ({
  attributes: true, 
  characterData: true, 
  childList: true, 
  subtree: true
}));

// Signature:
// - observeAttr('class')           -> Fixed attribute name
// - observeAttr({ prefix: 'data-' }) -> Dynamic key attribute with prefix
// - observeAttr({ prefix: '' })    -> Dynamic key attribute without prefix
const observeAttr = (spec) => observeMutation(
  ctx => ctx.host,
  (_, key) => {
    if (typeof spec === 'string') {
      return { attributeFilter: [spec] };
    }

    const name = key ? `${spec.prefix ?? ''}${toKebabCase(key)}` : null;
    return name ? { attributeFilter: [name] } : { attributes: true };
  }
);


// :::::: SOURCES DICTIONARY

const SOURCES = {
  attr    : observeDynamicAttr(''),
  data    : observeDynamicAttr('data-'),
  
  class   : observeAttr('class'),
  dir     : observeAttr('dir'),
  lang    : observeAttr('lang'),
  vars    : observeAttr('style'),

  meta    : headObserver,
  title   : headObserver,
  scheme  : combine(headObserver, fixedAttr('style')),

  focus   : observeEvents(ctx => ctx.document, ['focusin', 'focusout']),
  focused : observeEvents(view, ['focus', 'blur']),
  motion  : observeMedia('(prefers-reduced-motion: reduce)'),
  online  : observeEvents(view, ['online', 'offline']),
  scroll  : observeEvents(ctx => ctx.isDocument ? view(ctx) : ctx.host, ['scroll']),
  url     : observeEvents(view, ['hashchange', 'popstate']),
  visible : observeEvents(ctx => ctx.document, ['visibilitychange']),
};

// :::::: EQUALITY & DISTINCT OPERATOR

const isObject = x => x !== null && typeof x === 'object' && !(x instanceof Node);
const isEqual = (a, b) =>
  Object.is(a, b) || (isObject(a) && isObject(b) && JSON.stringify(a) === JSON.stringify(b));

const distinctUntilChanged = (read, callback) => {
  let prev = read();
  return () => {
    const next = read();
    if (!isEqual(next, prev)) {
      const old = prev;
      prev = next;
      callback(next, old);
    }
  };
};

// :::::: WATCH FACADE

function watch (ctx, path, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('[domina] watch(): the callback is not a function');
  }

  const [name, ...rest] = String(path).split('.');
  const key = rest.join('.') || null;
  const source = SOURCES[name];

  if (!source || !(name in ctx.facade)) {
    throw new TypeError(`[domina] watch(): "${path}" cannot be watched here`);
  }

  const read = () => key ? ctx.facade[name][key] : plainOf(ctx.facade, name);

  return source(ctx, key, distinctUntilChanged(read, callback));
}

const watchable = Object.keys(SOURCES);

export { watch, watchable };
