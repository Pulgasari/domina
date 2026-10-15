// @domina/chain/events.js
// listeners are kept per target, not per chain: d('.tab').off() removes what any
// d('.tab').on() added, without handler references or namespaces

import { delegateEvent } from '@domina/methods/delegateEvent';
import { emitEvent }     from '@domina/methods/emitEvent';
import { onEvent }       from '@domina/methods/onEvent';

const listeners = new WeakMap; // target -> Set<{ handler, selector, stop, type }>

const typesOf = types => String(types ?? '').split(/[\s,]+/).filter(Boolean);

function recordsOf (target) {
  let records = listeners.get(target);
  if (!records) listeners.set(target, records = new Set);
  return records;
}

function listen (target, type, selector, handler, options, once) {
  if (options?.signal?.aborted) return;

  const records = recordsOf(target);
  const record  = { handler, selector, stop: null, type };
  const drop    = () => { record.stop(); records.delete(record); };
  const call    = (event, element) => { if (once) drop(); handler(event, element); };

  record.stop = selector
    ? delegateEvent(target, type, selector, call, options)
    : onEvent(target, type, event => call(event, target), options);

  records.add(record);
  options?.signal?.addEventListener('abort', () => records.delete(record), { once: true });
}

// on(types, handler, options) or on(types, selector, handler, options)
function subscribe (chain, args, once) {
  const [types, selector, handler, options] = typeof args[1] === 'function' ? [args[0], null, ...args.slice(1)] : args;
  if (typeof handler !== 'function') throw new TypeError('[domina/chain] on(): the handler is not a function');

  const list = typesOf(types);
  for (const target of chain.elements) for (const type of list) listen(target, type, selector, handler, options, once);
  return chain;
}

export const on = {
  kind   : 'event',
  params : { types: 'string', selector: 'string', handler: 'function' },
  method (...args) { return subscribe(this, args, false); },
};

export const once = {
  kind   : 'event',
  params : { types: 'string', selector: 'string', handler: 'function' },
  method (...args) { return subscribe(this, args, true); },
};

// off() everything, off('click') one type, off('click', handler) one handler
export const off = {
  kind   : 'event',
  params : { types: 'string', handler: 'function' },
  method (types, handler) {
    const only = types ? new Set(typesOf(types)) : null;

    for (const target of this.elements) {
      const records = listeners.get(target);
      if (!records) continue;
      for (const record of records) {
        if (only && !only.has(record.type)) continue;
        if (handler && record.handler !== handler) continue;
        record.stop();
        records.delete(record);
      }
    }
    return this;
  },
};

export const emit = {
  kind   : 'event',
  params : { type: 'string', detail: 'json' },
  write  : (element, type, detail, options) => emitEvent(element, type, detail, options),
};
