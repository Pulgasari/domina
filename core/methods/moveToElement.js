// moveToElement.js

import { _el } from './../resolve.js';

// position: 'append' | 'prepend' | 'before' | 'after'
export const moveToElement = (spec, target, position = 'append') => {
  const element = _el(spec), destination = _el(target);
  if (!element || !destination) return null;

  if      (position === 'prepend') destination.prepend(element);
  else if (position === 'before')  destination.before(element);
  else if (position === 'after')   destination.after(element);
  else                             destination.append(element);

  return element;
};

export default moveToElement;
