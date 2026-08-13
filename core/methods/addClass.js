// @domina/core/methods/addClass.js

import { _el }    from './../resolve.js';
import { toList } from './../utils.js';

export const addClass = (spec, ...names) => {
  const element = _el(spec);
  if (!element) return null;
  const list = toList(names);
  if (list.length) element.classList.add(...list);
  return element;
};

export default addClass;
