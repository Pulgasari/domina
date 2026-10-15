// @domina/proxy
// @ts-self-types="./index.d.ts"
//
// domina is a facade for document: it reads like document, hands back real nodes,
// touches no prototype, and holds the document's state as properties.
//
//   domina.title       = 'Inbox (3)';
//   domina.vars.accent = 'tomato';
//   domina.on('click', '[data-action]', (event, el) => run(el.dataset.action));
//   domina('.card').style({ opacity: 1 });

import * as mirror   from './mirror.js';
import * as builtins from './spaces.js';

import { api, createFacade, plainOf, register, registerSpace, spaces } from './facade.js';
import { members }                                                   from './members.js';
import { watch, watchable }                                          from './watch.js';

const internal = { internal: true };

const SNAPSHOT = ['title', 'lang', 'dir', 'scheme', 'scroll', 'vars', 'data', 'class', 'meta'];

// :::::: ROOTS

const facades = new WeakMap;   // root -> facade, so within('#card') twice is the same facade

function rootOf (spec) {
  const root = typeof spec === 'string' ? document.querySelector(spec) : spec;
  if (!root || ![1, 9, 11].includes(root.nodeType)) throw new TypeError('[domina] within(): not an element, document or shadow root');
  return root;
}

function facadeOf (root) {
  let facade = facades.get(root);
  if (!facade) facades.set(root, facade = createFacade(root));
  return facade;
}

// :::::: REGISTRY

for (const [name, definition] of Object.entries({ ...members, ...mirror })) register(name, definition, internal);

const { classes, ...named } = builtins;
for (const [name, definition] of Object.entries({ ...named, class: classes })) registerSpace(name, definition, internal);

register('set', {
  make: ({ facade }) => map => {
    for (const [key, value] of Object.entries(map ?? {})) {
      if (spaces.has(key) && value !== null && typeof value === 'object') Object.assign(facade[key], value);
      else facade[key] = value;
    }
    return facade;
  },
}, internal);

register('snapshot', {
  make: ({ facade }) => () => Object.fromEntries(SNAPSHOT.filter(key => key in facade).map(key => [key, plainOf(facade, key)])),
}, internal);

register('toJSON', { make: ({ facade }) => () => facade.snapshot() }, internal);
register('watch',  { make: ctx => (path, callback) => watch(ctx, path, callback) }, internal);
register('within', { make: () => spec => facadeOf(rootOf(spec)) }, internal);

register('api',    { get: () => api }, internal);
register('extend', { make: () => definitions => { for (const [name, definition] of Object.entries(definitions)) register(name, definition); } }, internal);
register('space',  { make: () => (name, definition) => registerSpace(name, definition) }, internal);

// :::::: EXPORT

// without a dom every access says so, instead of "document is not defined" somewhere deeper
const unavailable = new Proxy(() => {}, {
  apply () { throw new Error('[domina] no document here'); },
  get   () { throw new Error('[domina] no document here'); },
});

export const domina = typeof document === 'undefined' ? unavailable : facadeOf(document);

export const extend = definitions => domina.extend(definitions);
export const within = spec => domina.within(spec);

export { api, registerSpace as space, watchable };
export default domina;
