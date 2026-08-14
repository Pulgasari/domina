// moveToElement.js

import { resolveElement } from './resolveElement.js';

// position: 'append' | 'prepend' | 'before' | 'after'
export function moveToElement (spec, target, position = 'append') {
  const element = resolveElement(spec), destination = resolveElement(target);
  if (!element || !destination) return null;

  if      (position === 'prepend') destination.prepend(element);
  else if (position === 'before')  destination.before(element);
  else if (position === 'after')   destination.after(element);
  else                             destination.append(element);

  return element;
}

export default moveToElement;
