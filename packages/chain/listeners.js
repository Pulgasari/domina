// @domina/chain/listeners.js
// listeners are kept per target, not per chain or facade: whatever added them,
// unlisten() finds them again without handler references or namespaces

import { delegateEvent } from '@domina/methods/delegateEvent';
import { onEvent }       from '@domina/methods/onEvent';

const listeners = new WeakMap; // target -> Set<{ handler, selector, stop, type }>

export const typesOf = types => String(types ?? '').split(/[\s,]+/).filter(Boolean);

function recordsOf (target) {
  let records = listeners.get(target);
  if (!records) listeners.set(target, records = new Set);
  return records;
}

function add (target, type, selector, handler, options, once) {
  const records = recordsOf(target);
  const record  = { handler, selector, stop: null, type };
  const drop    = () => { record.stop(); records.delete(record); };
  const call    = (event, element) => { if (once) drop(); handler(event, element); };

  record.stop = selector
    ? delegateEvent(target, type, selector, call, options)
    : onEvent(target, type, event => call(event, target), options);

  records.add(record);
  options?.signal?.addEventListener('abort', () => records.delete(record), { once: true });
  return drop;
}

// handler (event, element): element is the target, or the match of selector when delegated.
// returns one disposer for every type
export function listen (target, types, selector, handler, options, { once = false } = {}) {
  if (typeof handler !== 'function') throw new TypeError('[domina] the handler is not a function');
  if (options?.signal?.aborted) return () => {};

  const drops = typesOf(types).map(type => add(target, type, selector || null, handler, options, once));
  return () => { for (const drop of drops) drop(); };
}

// everything, by types, or by handler
export function unlisten (target, types, handler) {
  const records = listeners.get(target);
  if (!records) return;

  const only = types ? new Set(typesOf(types)) : null;
  for (const record of records) {
    if (only && !only.has(record.type)) continue;
    if (handler && record.handler !== handler) continue;
    record.stop();
    records.delete(record);
  }
}
