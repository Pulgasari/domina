// @domina/chain/events.js

import { emitEvent }        from '@domina/methods/emitEvent';
import { listen, unlisten } from './listeners.js';

// on(types, handler, options) or on(types, selector, handler, options)
function subscribe (chain, args, once) {
  const [types, selector, handler, options] = typeof args[1] === 'function' ? [args[0], null, ...args.slice(1)] : args;
  for (const target of chain.elements) listen(target, types, selector, handler, options, { once });
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
    for (const target of this.elements) unlisten(target, types, handler);
    return this;
  },
};

export const emit = {
  kind   : 'event',
  params : { type: 'string', detail: 'json' },
  write  : (element, type, detail, options) => emitEvent(element, type, detail, options),
};
