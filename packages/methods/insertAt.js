// insertAt.js

import { resolveElement } from './resolveElement.js';
import { flatNodes } from './../shared.js';

// Negative index counts from back: -1 = before last child, 0 = at very front
export function insertAt (target, index, ...nodes) {
  const element = resolveElement(target);
  if (!element) return null;

  const kids = flatNodes(nodes);
  if (!kids.length) return element;

  const children = element.children;
  const at  = index < 0 ? children.length + index : index;
  const ref = children[Math.max(0, Math.min(at, children.length))] ?? null;

  ref ? ref.before(...kids) : element.append(...kids);
  return element;
}

export default insertAt;
