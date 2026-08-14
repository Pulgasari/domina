// setContent.js

import { resolveElement } from './resolveElement.js';
import { flatNodes }      from './../utils.js';

// replaces entire element content with passed nodes
export function setContent (spec, ...nodes) {
  const element = resolveElement(spec); if (!element) return null;
  element.replaceChildren(...flatNodes(nodes));
  return element;
}

/*
export function setContent (spec, ...nodes) {
  return resolveElement(spec)?.replaceChildren(...flatNodes(nodes)) ?? null;
}
*/

export default setContent;
