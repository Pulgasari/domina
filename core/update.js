// update.js

import { _el } from './internal/resolve.js';
import { updateElement } from './element.js';
import { isArray, isFn, isString } from './internal/is.js';
import { flatNodes } from './internal/normalize.js';
import { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible } from './observer.js';

const observerEvents = { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible };

// todo: updateHead, updateTitle, updateMeta, updateStylesheet



// Findet oder erzeugt ein Element im <head>, identifiziert über einen Selektor.
const upsertHead = (selector, make) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = make();
    document.head.append(el);
  }
  return el;
};

export const

/**
 * updateHead({ title, meta, link, ...props })
 * Alles optional. meta/link akzeptieren Arrays von Descriptor-Objekten.
 */
updateHead = ({ title, meta, link, ...props } = {}) => {
  const head = HEAD();
  if (!head) return null;

  if (title != null) updateTitle(title);

  for (const spec of [].concat(meta ?? [])) updateMeta(spec);

  for (const spec of [].concat(link ?? [])) {
    const rel  = spec.rel ?? 'stylesheet';
    const href = spec.href ?? '';
    const el = upsertHead(
      `link[rel="${rel}"]${href ? `[href="${href}"]` : ''}`,
      () => document.createElement('link')
    );
    updateElement(el, spec);
  }

  if (Object.keys(props).length) updateElement(head, props);
  return head;
},

updateTitle = title => {
  const el = upsertHead('title', () => document.createElement('title'));
  el.textContent = String(title ?? '');
  return el;
},

/**
 * updateMeta({ name: 'description', content: '…' })
 * updateMeta({ property: 'og:image', content: '…' })
 * updateMeta({ charset: 'utf-8' })
 * content === null -> Tag wird entfernt.
 */
updateMeta = (spec = {}) => {
  const { name, property, httpEquiv, 'http-equiv': httpEquivAttr, charset } = spec;
  const equiv = httpEquiv ?? httpEquivAttr;

  const selector =
      name     ? `meta[name="${name}"]`
    : property ? `meta[property="${property}"]`
    : equiv    ? `meta[http-equiv="${equiv}"]`
    : charset  ? 'meta[charset]'
    : null;

  if (!selector) {
    console.warn('updateMeta: needs name, property, http-equiv or charset.', spec);
    return null;
  }

  if (spec.content === null) {
    document.head.querySelector(selector)?.remove();
    return null;
  }

  const el = upsertHead(selector, () => document.createElement('meta'));
  return updateElement(el, spec);
};
