// setClass.js

import { resolveElement } from './resolveElement.js';
import { toList }         from './../utils.js';

// Ersetzt das gesamte class-Attribut
export function setClass (spec, names) {
  const element = resolveElement(spec);
  if (!element) return null;
  element.setAttribute('class', toList(names).join(' '));
  return element;
}

export default setClass;
