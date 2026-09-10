// @domina/element/lazy
//
// lazy, asynchronous element sugar with zero upfront method loading. each
// wrapped method loads its @domina/methods module on first use via dynamic
// import(), then caches it. calls queue onto a fluent, awaitable handle; the
// queue runs on await:
//
//   await element('#box').setData({ open: true }).addClass('ready');
//   const data = await element('#box').getData();
//
// awaiting resolves to the last step's result: the raw element after
// chain/self/find steps, the value after a value getter, the disposer after a
// stop step. this needs a runtime that resolves the bare @domina/methods
// subpaths (deno workspace, or a browser import map).
//
// note: value getters do not end the chain here the way they do in the eager
// variant; every step returns the same awaitable handle. for synchronous
// access, the eager .attr/.ok proxies and the elements()/get helpers, use
// @domina/element.

import { API, NODE, isWrapped } from './_api.js';

// :::::: MODULE CACHE

const cache = new Map();

const load = async name => {
  let fn = cache.get(name);
  if (fn) return fn;
  const mod = await import(`@domina/methods/${name}`);
  fn = mod[name] ?? mod.default;
  cache.set(name, fn);
  return fn;
};

// :::::: QUEUE RUNNER

const run = async steps => {
  let node = null;
  let last;

  for (const step of steps) {
    if (step.kind === '_root') {
      const resolveElement = await load('resolveElement');
      node = resolveElement(...step.args);
      last = node;
      continue;
    }
    if (step.kind === '_subject') {
      const getElement = await load('getElement');
      node = getElement(step.args[0], node);
      last = node;
      continue;
    }
    if (step.kind === 'child') {
      const [getElement, fn] = await Promise.all([load('getElement'), load(step.method)]);
      const [sel, ...args] = step.args;
      fn(getElement(sel, node), ...args);
      last = node;
      continue;
    }

    const fn = await load(step.method);
    const result = fn(node, ...step.args);

    if (step.kind === 'chain') { node = result === node ? node : result; last = node; }
    else if (step.kind === 'self') { last = node; }
    else last = result; // value + stop
  }

  return last;
};

// :::::: FLUENT HANDLE

const step = (steps, method, kind, args) => makeChain([...steps, { method, kind, args }]);

const makeChain = steps => {
  const box = { steps, promise: null };
  const flush = () => (box.promise ??= run(steps));

  return new Proxy(box, {
    get (target, prop) {
      if (typeof prop === 'symbol') return prop === NODE ? true : undefined;

      if (prop === 'then')    return (onF, onR) => flush().then(onF, onR);
      if (prop === 'catch')   return onR        => flush().catch(onR);
      if (prop === 'finally') return onF         => flush().finally(onF);

      // subject switch to a descendant
      if (prop === 'find') return spec => step(steps, 'getElement', '_subject', [spec]);

      const entry = API[prop];
      if (!entry) return undefined;
      const [method, kind] = entry;
      return (...args) => step(steps, method, kind, args);
    },
  });
};

// :::::: FACTORY

/** lazy, awaitable handle. never rejects on a missing element; ops no-op on null. */
export const element = (spec, ctx) => {
  if (isWrapped(spec)) return spec;
  return makeChain([{ kind: '_root', args: [spec, ctx] }]);
};

export { isWrapped };
