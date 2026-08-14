// containsElement.js

import { resolveElement } from './resolveElement.js';

export function containsElement (spec, other) {
  const element = resolveElement(spec);
  const target  = resolveElement(other);
  return !!element && !!target && element !== target && element.contains(target);
}

export default containsElement;
