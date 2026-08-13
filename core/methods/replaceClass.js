// @domina/core/methods/replaceClass.js

import { _el }    from './../resolve.js';
import { toList } from './../utils.js';

export const replaceClass = (spec, from, to) => {
  const element = _el(spec); if (!element) return null;
  
  // classList.replace() tauscht nur, wenn `from` vorhanden ist 
  // – hier soll `to` immer landen    
  element.classList.remove(...toList(from));
  element.classList.add   (...toList(to));
  
  return element;
};

export default replaceClass;
