// toggleClass.js

import { _el }      from './../resolve.js';
import { toList }   from './../utils.js';
import { isObject } from './../vendors.js';

/**
 * toggleClass(spec, 'active')              -> umschalten
 * toggleClass(spec, 'active', true)        -> erzwingen
 * toggleClass(spec, { active: isOpen })    -> pro Klasse erzwingen, force entfällt
 */
export const toggleClass = (spec, names, force) => {
  const element = _el(spec); if (!element) return null;

  if (isObject(names)) {
    for (const [name, on] of Object.entries(names)) element.classList.toggle(name, Boolean(on));
    return element;
  }

  for (const name of toList(names)) element.classList.toggle(name, force);
  return element;
};

export default toggleClass;
