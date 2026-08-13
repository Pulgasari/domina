// insertAt.js

import { _el } from './../resolve.js';
import { flatNodes } from './../utils.js';

// Negative index counts from back: -1 = before last child, 0 = at very front
export const insertAt = (target, index, ...nodes) => {
  const element = _el(target);
  if (!element) return null;

  const kids = flatNodes(nodes);
  if (!kids.length) return element;

  const children = element.children;
  const at  = index < 0 ? children.length + index : index;
  const ref = children[Math.max(0, Math.min(at, children.length))] ?? null;

  ref ? ref.before(...kids) : element.append(...kids);
  return element;
};

export default insertAt;
