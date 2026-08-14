// setScroll.js

import { resolveElement } from './resolveElement.js';
import { isWindow } from './../vendors.js';

const scrollRoot = spec => !spec || isWindow(spec) || spec === document ? null : resolveElement(spec);

export function setScroll (spec, { top, left, behavior = 'auto' } = {}) {
  const target = scrollRoot(spec) ?? window;
  const options = { behavior };
  if (top  != null) options.top  = top;
  if (left != null) options.left = left;

  target.scrollTo(options);
  return target;
}

export default setScroll;
