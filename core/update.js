// update.js

import { _el } from './internal/resolve.js';
import { isArray, isFn, isString } from './internal/is.js';
import { flatNodes } from './internal/normalize.js';
import { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible } from './observer.js';

const observerEvents = { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible };

// todo: updateHead, updateTitle, updateMeta, updateStylesheet

export const updateElement = (spec, props = {}, ...children) => {
  const element = _el(spec);
  if (!element) return null;

  // SVG-Elemente haben read-only Props (className, href) -> immer setAttribute
  const isSVG = element instanceof SVGElement;
  let mountFn, mountTo;

  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;

    // appendTo + prependTo
    if      (key === 'appendTo')  { mountTo = value; mountFn = 'append';  }
    else if (key === 'prependTo') { mountTo = value; mountFn = 'prepend'; }

    // style
    else if (key === 'style') {
      if (isString(value)) element.setAttribute('style', value);
      else for (const [p, v] of Object.entries(value))
        p.includes('-') ? element.style.setProperty(p, v) : (element.style[p] = v);
    }

    // dataset
    else if (key === 'dataset' || key === 'data') {
      Object.assign(element.dataset, value);
    }

    // class
    else if (key === 'class' || key === 'className') {
      element.setAttribute('class',
        isArray(value) ? value.flat(Infinity).filter(Boolean).join(' ') : value);
    }

    // event / observer
    else if (key.startsWith('on') && isFn(value)) {
      const observerFn = observerEvents[key];
      observerFn ? observerFn(element, value)
                 : element.addEventListener(key.slice(2).toLowerCase(), value);
    }

    // prop + attribute
    else if (!isSVG && key in element) element[key] = value;
    else element.setAttribute(key, value);
  }

  const kids = flatNodes(children);
  if (kids.length) element.append(...kids);
  if (mountTo) _el(mountTo)?.[mountFn](element);

  return element;
};

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
},

/**
 * updateStylesheet(css)                      -> anonymes <style>, jedes Mal neu
 * updateStylesheet(css, { id: 'theme' })     -> idempotent, ersetzt Inhalt
 * updateStylesheet(null, { id: 'theme' })    -> entfernt
 */
updateStylesheet = (css, { id, media } = {}) => {
  if (css === null && id) {
    document.getElementById(id)?.remove();
    return null;
  }

  const el = id
    ? upsertHead(`style#${id}`, () => updateElement(document.createElement('style'), { id }))
    : (() => { const s = document.createElement('style'); document.head.append(s); return s; })();

  el.textContent = String(css ?? '');
  if (media) el.media = media;
  return el;
};
