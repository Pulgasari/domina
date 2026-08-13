// @domina/core/content.js

import { _el } from './internal/resolve.js';
import { flatNodes } from './internal/normalize.js';
import { createHTML } from './create.js';

export const

getText = spec => _el(spec)?.textContent ?? null,

setText = (spec, text) => {
  const element = _el(spec);
  if (!element) return null;
  element.textContent = text == null ? '' : String(text);
  return element;
},

getHTML = spec => _el(spec)?.innerHTML ?? null,

/**
 * setHTML(spec, '<b>x</b>')
 * Geht über <template>, damit auch <tr>/<option> korrekt parsen, und leert
 * vorher via replaceChildren – der alte Baum ist danach sicher draussen.
 */
setHTML = (spec, html) => {
  const element = _el(spec);
  if (!element) return null;
  element.replaceChildren(createHTML(html ?? ''));
  return element;
},

// Ersetzt den gesamten Inhalt durch die übergebenen Nodes
setContent = (spec, ...nodes) => {
  const element = _el(spec);
  if (!element) return null;
  element.replaceChildren(...flatNodes(nodes));
  return element;
},

emptyElement = spec => {
  const element = _el(spec);
  if (!element) return null;
  element.replaceChildren();
  return element;
};
