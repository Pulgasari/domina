// @domina/proxy :: members

/*
what a facade adds to its root. the methods are named and behave like the
native ones, a native call stays native: only where the native one throws or
does nonsense, the gap is filled.

  querySelector({ id: 'app' })                  a spec object, natively a SyntaxError
  querySelectorAll({ tag: 'li' })               a NodeList, as natively
  getElement(spec, context?)                    the first match or null
  getElements(spec, context?)                   a List (query.js): find/filter take a matcher or selector
  get, getList                                  short names of the two, to find out which reads better
  createElement('button', { class, onClick }, 'save')   props and children ({ is } and strings stay native)
  addEventListener / removeEventListener        see events.js

  root       the element of the facade (<html> for the document)
  meta       see meta.js
  url        the url of the page, as @pulgasari/url (a copy: changing it moves nothing)
  observer   @domina/observer
  a11y, media                                   see media.js
*/

import { buildSelector } from '@domina/verbs/buildSelector.js';
import { getElement }    from '@domina/verbs/getElement.js';
import { getElements }   from '@domina/verbs/getElements.js';
import { updateElement } from '@domina/verbs/updateElement.js';

import * as observer from '@domina/observer';
import { url }       from '@pulgasari/url';

import { listen, unlisten }   from './events.js';
import { a11y, media }        from './media.js';
import { meta }               from './meta.js';
import { List }               from './query.js';
import { isPlainObject, isString } from './shared.js';

const selectorOf = spec => isPlainObject(spec) ? buildSelector(spec) : spec;

// a string, { is } or nothing: what createElement() takes natively
const isNative = (props, children) => !children.length && (props == null || isString(props) || (isPlainObject(props) && Object.keys(props).every(key => key === 'is')));

export function membersOf ({ document, host, root }) {
  const first = (spec, context = root) => getElement(spec, context);
  const all   = (spec, context = root) => List.from(getElements(spec, context));

  return {

    // :::::: QUERY

    querySelector    (spec) { return root.querySelector(selectorOf(spec)); },
    querySelectorAll (spec) { return root.querySelectorAll(selectorOf(spec)); },

    getElement  : first,
    getElements : all,
    get         : first,
    getList     : all,

    // :::::: CREATE

    createElement (tag, props, ...children) {
      if (isNative(props, children)) return document.createElement(tag, props);
      const { is, ...rest } = props ?? {};
      return updateElement(document.createElement(tag, is == null ? undefined : { is }), rest, ...children);
    },

    // :::::: EVENTS

    addEventListener    (types, ...args)             { return listen(root, types, ...args); },
    removeEventListener (types, listener, options)   { unlisten(root, types, listener, options); },

    // :::::: PROPERTIES

    get a11y     () { return a11y; },
    get media    () { return media; },
    get meta     () { return meta; },
    get observer () { return observer; },
    get root     () { return host; },
    get url      () { return url(document.URL); },
  };
}
