// createFragment.js

import { flatNodes } from './../internal/normalize.js';

export const createFragment = (...nodes) => {
  const fragment = document.createDocumentFragment();
  const children = flatNodes(nodes);
  
  if (children.length) fragment.append(...children);
  return fragment;
}

export default createFragment;
