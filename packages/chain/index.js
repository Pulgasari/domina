// @domina/chain
// @ts-self-types="./index.d.ts"
//
// d('.card').style({ opacity: 0 }).attr('role', 'article').on('click', '.more', open)
// a set of elements, short verbs, everything chainable. @domina/methods does the work

import * as core   from './api.js';
import * as events from './events.js';

import { Chain, collect }      from './chain.js';
import { api, define, extend } from './define.js';

extend({ ...core, ...events });

// d(chain) is the chain itself, no copy
export function d (spec, context) {
  return spec instanceof Chain ? spec : new Chain(collect(spec, context));
}

// d(...).all: getters answer for every element
export function dd (spec, context) {
  return new Chain(collect(spec, context), true);
}

d.all    = dd;
d.api    = api;
d.define = define;
d.extend = extend;

export { Chain, api, define, extend };
export default d;
