// createFragment.js

import { flatNodes } from './../shared.js';

export function createFragment (...nodes) {
  const fragment = document.createDocumentFragment();
  const children = flatNodes(nodes);
  
  if (children.length) fragment.append(...children);
  return fragment;
}

export default createFragment;
