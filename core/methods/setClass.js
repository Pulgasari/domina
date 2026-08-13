// setClass.js

import { _el }    from './../resolve.js';
import { toList } from './../utils.js';

// Ersetzt das gesamte class-Attribut
export const setClass = (spec, names) => {
  const element = _el(spec);
  if (!element) return null;
  element.setAttribute('class', toList(names).join(' '));
  return element;
};

export default setClass;
