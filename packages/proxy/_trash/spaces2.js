// @domina/proxy/spaces.js
// the built-in namespaces. ctx: { document, facade, host, isDocument, root }
// host is the element they write to: <html> for the document, the element or the shadow host otherwise

// :::::: IMPORT

import getCustomProperty from '@domina/verbs/getCustomProperty.js';
import getFormValues     from '@domina/verbs/getFormValues.js';
import getMeta           from '@domina/verbs/getMeta.js';
import removeMeta        from '@domina/verbs/removeMeta.js';
import setAttr           from '@domina/verbs/setAttr.js';
import setCustomProperty from '@domina/verbs/setCustomProperty.js';
import setData           from '@domina/verbs/setData.js';
import setFormValues     from '@domina/verbs/setFormValues.js';
import setMeta           from '@domina/verbs/setMeta.js';

import getStyleToken from '@domina/verbs/getStyleToken.js';
import setStyleToken from '@domina/verbs/setStyleToken.js';

import { toCamelCase, toKebabCase, undashed } from './shared.js';

const formOf    = (name, { document }) => document.forms.namedItem(name);
const formNames = (      { document }) => [...document.forms].map(form => form.name || form.id).filter(Boolean);

// :::::: STYLE

// read: the computed value. keys: the inline custom properties, nothing else can be listed
export const vars = {
  get    : (name,        { host }) =>   getStyleToken (name,        host),
  set    : (name, value, { host }) => { setStyleToken (name, value, host); },
  delete : (name,        { host }) => { host.style.removeProperty(`--${undashed(name)}`); },
  keys   : ({ host })              => [...host.style].filter(property => property.startsWith('--')).map(undashed),
};

export const vars = {
  get    : (name,        { host }) =>    getStyleToken (name,        host),
  set    : (name, value, { host }) =>    setStyleToken (name, value, host),
  delete : (name,        { host }) => removeStyleToken (name,        host),
  keys   : (             { host }) =>   getStyleTokens (             host).toKeys(),
};

export const vars = {
  get    : getStyleToken,
  set    : setStyleToken,
  delete : removeStyleToken,
  keys   : ({ host }) => getStyleTokens(host).toKeys(),
};

export const style = {
  getToken    : getStyleToken,
  setToken    : setStyleToken,
  deleteToken : removeStyleToken,
  getTokens       : ({ host }) => getStyleTokens(host),
  getKeysOfTokens : ({ host }) => getStyleTokens(host).toKeys(),
};


// :::::: ATTRIBUTES

// strings in, strings out. true is an empty attribute, false removes
export const data = {
  get    : (name, { host })        => host.dataset[toCamelCase(name)] ?? null,
  set    : (name, value, { host }) => { value === false ? delete host.dataset[toCamelCase(name)] : setData(host, name, value === true ? '' : value); },
  delete : (name, { host })        => { delete host.dataset[toCamelCase(name)]; },
  keys   : ({ host })              => Object.keys(host.dataset),
};

export const attr = {
  get    : (name, { host })        => host.getAttribute(toKebabCase(name)),
  set    : (name, value, { host }) => { setAttr(host, name, value); },
  delete : (name, { host })        => { host.removeAttribute(toKebabCase(name)); },
  keys   : ({ host })              => host.getAttributeNames(),
};

// class.name = boolean toggles, Object.keys(class) lists them
export const classes = {
  get    : (name, { host })        => host.classList.contains(name),
  set    : (name, value, { host }) => { host.classList.toggle(name, Boolean(value)); },
  delete : (name, { host })        => { host.classList.remove(name); },
  has    : (name, { host })        => host.classList.contains(name),
  keys   : ({ host })              => [...host.classList],
};

// :::::: DOCUMENT

export const meta = {
  only   : 'document',
  get    : key          => getMeta(key),
  set    : (key, value) => { setMeta(key, value); },
  delete : key          => { removeMeta(key); },
  keys   : ()           => Object.keys(getMeta()),
};

export const id = {
  get  : (name, { root }) => root.getElementById ? root.getElementById(name) : root.querySelector(`#${CSS.escape(name)}`),
  keys : ({ root })       => [...root.querySelectorAll('[id]')].map(element => element.id),
};

export const forms = {
  only : 'document',
  get  : formOf,
  keys : formNames,
};

export const values = {
  only : 'document',
  get  : (name, ctx)        => { const form = formOf(name, ctx); return form ? getFormValues(form) : null; },
  set  : (name, value, ctx) => { const form = formOf(name, ctx); if (form) setFormValues(form, value); },
  keys : formNames,
};
