// getParent.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';

const passes = (element, filter) => !filter || element.matches(buildSelector(filter));

export function getParent (spec, filter) {
  const parent = resolveElement(spec)?.parentElement ?? null;
  return parent && passes(parent, filter) ? parent : null;
}

export default getParent;
