// @domina/proxy
// @ts-self-types="./index.d.ts"

/*
domina is a facade for document: it reads like document, hands back real
nodes, touches no prototype and fills the gaps where the native api throws
or does nonsense.

  domina.querySelector({ id: 'app' });
  domina.getElements('.card').find({ active: true });
  domina.createElement('button', { class: 'primary', onClick: save }, 'save');
  const stop = domina.addEventListener('click', '[data-action]', handler);
  domina.meta.description = 'notes';
  domina.within('#card').getElement('.title');

the chain (d, dd) is @domina/chain, both together @domina/dom. what is gone
from earlier versions waits in _trash/.
*/

import { extensions, facadeOf } from './facade.js';

function rootOf (spec) {
  const root = typeof spec === 'string' ? document.querySelector(spec) : spec;
  if (!root || ![1, 9, 11].includes(root.nodeType)) throw new TypeError('[domina] within(): not an element, document or shadow root');
  return root;
}

// the same facade for an element or a shadow root: queries and events stay below it
const within = spec => facadeOf(rootOf(spec));

// without a dom every access says so, instead of "document is not defined" somewhere deeper
const unavailable = new Proxy({}, { get () { throw new Error('[domina] no document here'); } });

const domina = typeof document === 'undefined' ? unavailable : facadeOf(document);

// own members for every facade, as an object: methods, getters, setters. no name domina or document has already
function extend (definitions) {
  for (const key of Object.keys(definitions)) if (key in extensions || key in domina) throw new Error(`[domina] "${key}" exists already`);
  Object.defineProperties(extensions, Object.getOwnPropertyDescriptors(definitions));
}

Object.defineProperties(extensions, Object.getOwnPropertyDescriptors({ extend, within }));

// :::::: EXPORT

export { a11y, media }     from './media.js';
export { meta }            from './meta.js';
export { List, matcherOf } from './query.js';
export { domina, extend, within };
export default domina;
