// @domina/core/methods/removeClass.js

import { _el }    from './../resolve.js';
import { toList } from './../utils.js';

export const removeClass = (spec, ...names) => {
  const element = _el(spec);
  if (!element) return null;
  const list = toList(names);
  if (list.length) element.classList.remove(...list);
  return element;
};

export default removeClass;
