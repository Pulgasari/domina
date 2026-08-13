// setContent.js

import { _el }       from './../resolve.js';
import { flatNodes } from './../utils.js';

// replaces entire element content with passed nodes
export const setContent = (spec, ...nodes) => {
  const element = _el(spec); if (!element) return null;
  element.replaceChildren(...flatNodes(nodes));
  return element;
};

/*
export const setContent = (spec, ...nodes) => {
  return _el(spec)?.replaceChildren(...flatNodes(nodes)) ?? null;
};
*/

export default setContent;
