// @domina/chain
// @ts-self-types="./index.d.ts"

// :::::: IMPORT

import * as core   from './api.js';
import * as events from './events.js';

import { Chain, collect }            from './chain.js';
import { api, define, extend }       from './define.js';
import { listen, typesOf, unlisten } from './listeners.js';
import { isChain }                   from './shared.js';

// :::::: BUILD

extend({ ...core, ...events });

// d(chain) is the chain itself, no copy
function d (spec, context) {
  return isChain(spec) ? spec : new Chain (collect(spec, context));
}

// [dd] d(...).all: getters answer for every element
function dd (spec, context) {
  return new Chain (collect(spec, context), true);
}

d.all    = dd;
d.api    = api;
d.define = define;
d.extend = extend;

// :::::: EXPORT

export { Chain, d, dd, api, define, extend, listen, typesOf, unlisten };
export default d;
