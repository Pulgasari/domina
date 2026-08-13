// @domina/core/methods/hasClass.js

import { _el }    from './../resolve.js';
import { toList } from './../utils.js';

export const hasClass = (spec, names) => {
  const element = _el(spec); if (!element) return false;
  const list    = toList(names);
  
  return list.length > 0 && list.every(name => element.classList.contains(name));   
};

export default hasClass;
