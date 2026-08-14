// containsElement.js

import { _el } from './../resolve.js';

export const containsElement = (spec, other) => {
  const element = _el(spec);
  const target  = _el(other);
  return !!element && !!target && element !== target && element.contains(target);
};

export default containsElement;
