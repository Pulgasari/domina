// moveToNode.js

import { resolveNode } from './../resolve.js';

// Accepts any Node (Element, TextNode, DocumentFragment) or selector for target
const resolveNode = sth => sth instanceof Node ? sth : _el(sth);

/**
 * position: 'append' | 'prepend' | 'before' | 'after'
 * Works with Elements, TextNodes, and DocumentFragments.
 */
export const moveToNode = (spec, target, position = 'append') => {
  const node        = resolveNode(spec);
  const destination = resolveNode(target);

  if (!node || !destination) return null;

  if      (position === 'prepend') destination.prepend(node);
  else if (position === 'before')  destination.before(node);
  else if (position === 'after')   destination.after(node);
  else                             destination.append(node);

  return node;
};

export default moveToNode;
