// getParent.js

import { buildSelector }  from './buildSelector.js';
import { resolveElement } from './resolveElement.js';

const passes = (element, filter) => !filter || element.matches(buildSelector(filter));

export function getParent (spec, filter) {
  const parent = resolveElement(spec)?.parentElement ?? null;
  return parent && passes(parent, filter) ? parent : null;
}

export default getParent;
