// @domina/proxy/members.js
// document state and environment as values. { get (ctx), set (value, ctx), only }

import { getScroll } from '@domina/verbs/getScroll.js';
import { setMeta }   from '@domina/verbs/setMeta.js';
import { setScroll } from '@domina/verbs/setScroll.js';

const attribute = name => ({
  get : ({ host })        => host.getAttribute(name),
  set : (value, { host }) => { value == null ? host.removeAttribute(name) : host.setAttribute(name, value); },
});

/*
import { getAttribute, setAttribute } from './methods.js';

const attribute = (key) => ({
  get : (       { host }) => getAttribute(host, key),
  set : (value, { host }) => setAttribute(host, key, value),
});
*/

const once = (target, type) => new Promise(resolve => target.addEventListener(type, () => resolve(), { once: true }));

// activeElement stops at a shadow host, the focused element may sit deeper
function deepActive (doc) {
  let active = doc.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

export const members = {

  // :::::: NODES

  document : { get: ({ document }) => document },
  root     : { get: ({ host })     => host },
  body     : { only: 'document', get: ({ document }) => document.body },
  head     : { only: 'document', get: ({ document }) => document.head },

  // :::::: STATE

  title : {
    only : 'document',
    get  : ({ document })        => document.title,
    set  : (value, { document }) => { document.title = value ?? ''; },
  },

  lang : attribute('lang'),
  dir  : attribute('dir'),

  // <meta name="color-scheme"> for the ua before css loads, color-scheme on :root after
  scheme : {
    only : 'document',
    get  : ({ document })        => document.querySelector('meta[name="color-scheme"]')?.content ?? null,
    set  : (value, { document }) => { setMeta('color-scheme', value); document.documentElement.style.colorScheme = value ?? ''; },
  },

  // { x, y }. setting takes { x, y, smooth }
  scroll : {
    get : ctx => {
      const { left, top } = getScroll(ctx.isDocument ? null : ctx.host);
      return { x: left, y: top };
    },
    set : ({ smooth = false, x, y } = {}, ctx) => {
      setScroll(ctx.isDocument ? null : ctx.host, { behavior: smooth ? 'smooth' : 'auto', left: x, top: y });
    },
  },

  // the innermost focused element. setting focuses a selector or an element
  focus : {
    only : 'document',
    get  : ({ document })         => deepActive(document),
    set  : (target, { document }) => { (typeof target === 'string' ? document.querySelector(target) : target)?.focus?.(); },
  },

  // :::::: ENVIRONMENT

  ready : {
    only : 'document',
    get  : ({ document }) => document.readyState === 'loading' ? once(document, 'DOMContentLoaded') : Promise.resolve(),
  },

  loaded : {
    only : 'document',
    get  : ({ document }) => document.readyState === 'complete' ? Promise.resolve() : once(document.defaultView ?? globalThis, 'load'),
  },

  fontsReady : {
    only : 'document',
    get  : ({ document }) => document.fonts?.ready.then(() => {}) ?? Promise.resolve(),
  },

  visible : { only: 'document', get: ({ document }) => document.visibilityState === 'visible' },
  focused : { only: 'document', get: ({ document }) => document.hasFocus() },
  online  : { only: 'document', get: () => globalThis.navigator?.onLine ?? true },
  motion  : { only: 'document', get: () => !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches },
  url     : { only: 'document', get: ({ document }) => new URL(document.location?.href ?? document.URL) },

};
