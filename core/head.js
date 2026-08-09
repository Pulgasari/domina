// @domina/core/head.js

import { isObject } from './internal/is.js';
import { arrayfied } from './internal/normalize.js';
import { updateElement } from './element.js';
import { setMeta } from './meta.js';

/** Findet ein Element im <head> über einen Selektor oder legt es an. */
export const upsertHead = (selector, make) => {
  const head = document.head;
  let element = head.querySelector(selector);
  if (!element) {
    element = make();
    head.append(element);
  }
  return element;
};

export const

getHead = () => document.head,

getTitle = () => document.title,

setTitle = title => {
  const element = upsertHead('title', () => document.createElement('title'));
  element.textContent = String(title ?? '');
  return element;
},

/**
 * setLink({ rel: 'stylesheet', href: '/app.css' })
 * Identifiziert über rel + href, ist also idempotent.
 */
setLink = (spec = {}) => {
  const rel  = spec.rel ?? 'stylesheet';
  const href = spec.href ?? '';
  const element = upsertHead(
    `link[rel="${rel}"]${href ? `[href="${href}"]` : ''}`,
    () => document.createElement('link')
  );
  return updateElement(element, { rel, ...spec });
},

/**
 * setHead({ title, meta, link, ...props })
 * meta nimmt eine Key/Value-Map (oder ein Array davon), link Descriptor-Objekte.
 * Restliche Props landen als updateElement-Props auf dem <head> selbst.
 */
setHead = ({ title, meta, link, ...props } = {}) => {
  const head = document.head;
  if (!head) return null;

  if (title != null) setTitle(title);
  for (const spec of arrayfied(meta)) if (isObject(spec)) setMeta(spec);
  for (const spec of arrayfied(link)) setLink(spec);
  if (Object.keys(props).length) updateElement(head, props);

  return head;
};

export const updateHead = setHead, updateTitle = setTitle;
