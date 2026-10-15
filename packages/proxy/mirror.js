// @domina/proxy/mirror.js
// the methods of document, mirrored: native arguments behave natively, only gaps are filled
// (where the native call throws or does nonsense). and the short forms next to them.
// { make (ctx) -> function }: built once per facade

import { dd, listen, typesOf, unlisten } from '@domina/chain';

import { buildSelector } from '@domina/methods/buildSelector';
import { createHTML }    from '@domina/methods/createHTML';
import { getElement }    from '@domina/methods/getElement';
import { getElements }   from '@domina/methods/getElements';
import { updateElement } from '@domina/methods/updateElement';

const isPlainObject = value => value !== null && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value));

// a spec object fills the gap, anything else goes to the native call as it is
const selectorOf = spec => isPlainObject(spec) ? buildSelector(spec) : spec;

const ESCAPES = { '"': '&quot;', '&': '&amp;', "'": '&#39;', '<': '&lt;', '>': '&gt;' };
const escape  = value => Array.isArray(value) ? value.map(escape).join('') : String(value ?? '').replace(/["&'<>]/g, char => ESCAPES[char]);

// (types, handler, options) or (types, selector, handler, options)
const listenerArgs = args => typeof args[0] === 'function' ? [null, ...args] : args;

function build (document, tag, props, children) {
  const { is, ...rest } = props ?? {};
  const element = document.createElement(tag, is == null ? undefined : { is });
  return updateElement(element, rest, ...children);
}

// :::::: MIRRORED

export const querySelector = {
  make: ({ root }) => function querySelector (spec) { return root.querySelector(selectorOf(spec)); },
};

export const querySelectorAll = {
  make: ({ root }) => function querySelectorAll (spec) { return root.querySelectorAll(selectorOf(spec)); },
};

// props and children fill the gap. a string or { is } alone stay native
export const createElement = {
  only : 'document',
  make : ({ document }) => function createElement (tag, props, ...children) {
    const native = !children.length && (props == null || typeof props === 'string' || (isPlainObject(props) && Object.keys(props).every(key => key === 'is')));
    return native ? document.createElement(tag, props) : build(document, tag, props, children);
  },
};

// a selector as second argument delegates, several types are split. a disposer comes back
export const addEventListener = {
  make: ({ root }) => function addEventListener (types, ...args) {
    if (typeof args[0] === 'string') {
      const [selector, handler, options] = args;
      return listen(root, types, selector, handler, options);
    }

    const [listener, options] = args;
    const list = typesOf(types);
    for (const type of list) root.addEventListener(type, listener, options);
    return () => { for (const type of list) root.removeEventListener(type, listener, options); };
  },
};

// without a listener: everything domina added for these types
export const removeEventListener = {
  make: ({ root }) => function removeEventListener (types, listener, options) {
    if (listener != null) for (const type of typesOf(types)) root.removeEventListener(type, listener, options);
    unlisten(root, types, listener ?? undefined);
  },
};

// :::::: SHORT FORMS

export const get = {
  make: ({ root }) => (spec, context) => getElement(spec, context ?? root),
};

export const getList = {
  make: ({ root }) => (spec, context) => getElements(spec, context ?? root),
};

export const all = {
  make: ({ isDocument, root }) => (spec, context) => dd(spec, context ?? (isDocument ? undefined : root)),
};

export const create = {
  only : 'document',
  make : ({ document }) => (tag = 'div', props, ...children) => build(document, tag, props, children),
};

// a template literal with escaped values, or a string taken as html as it is
export const html = {
  only : 'document',
  make : () => (strings, ...values) => createHTML(typeof strings === 'string'
    ? strings
    : strings.reduce((out, part, index) => out + escape(values[index - 1]) + part)),
};

export const on = {
  make: ({ root }) => (types, ...args) => {
    const [selector, handler, options] = listenerArgs(args);
    return listen(root, types, selector, handler, options);
  },
};

export const once = {
  make: ({ root }) => (types, ...args) => {
    const [selector, handler, options] = listenerArgs(args);
    return listen(root, types, selector, handler, options, { once: true });
  },
};

export const off = {
  make: ({ root }) => (types, handler) => unlisten(root, types, handler),
};

// a CustomEvent on the root, bubbling. false when a listener called preventDefault()
export const emit = {
  make: ({ root }) => (type, detail = null, options) => root.dispatchEvent(new CustomEvent(type, { bubbles: true, cancelable: true, ...options, detail })),
};
