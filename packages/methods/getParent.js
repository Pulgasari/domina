// getParent.js

import { resolveElement } from './resolveElement.js';
import { passes }         from './_shared.js';

export function getParent (spec, filter) {
  const parent = resolveElement(spec)?.parentElement ?? null;
  return parent && passes(parent, filter) ? parent : null;
}

export default getParent;
