// @domina/dom
// @ts-self-types="./index.d.ts"

/*
the two apis of domina in one import:

  dom              @domina/proxy: reads like document (dom.querySelector, dom.meta, dom.observer …)
  dom('.card')     d('.card'): @domina/chain, like $ of jquery
  d, dd            the chain, like $ and $$

  import { dom, d, dd } from '@domina/dom';

  dom.title = 'notes';
  dom.getElements('.card').find({ active: true });
  dom('.card').style({ opacity: 1 });
  dom.observer.observe('.card', { onMatch: card => … });

proxy and chain stay two packages, dom only joins them: a call goes to d(),
everything else to the facade of document.
*/

import { d, dd }   from '@domina/chain';
import { domina }  from '@domina/proxy';

// an arrow function as target: callable, without a prototype the proxy would have to report
const dom = new Proxy(() => {}, {
  apply : (target, self, [spec, context]) => d(spec, context),
  get   : (target, key)        => domina[key],
  has   : (target, key)        => key in domina,
  set   : (target, key, value) => { domina[key] = value; return true; },
});

// :::::: EXPORT

export { d, dd, dom };
export default dom;
