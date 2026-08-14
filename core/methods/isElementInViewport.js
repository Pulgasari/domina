// isElementInViewport.js

import { resolveElement } from './resolveElement.js';

/** ratio: 0 = one pixel is enough, 1 = element must be fully visible */
export function isElementInViewport (spec, { ratio = 0 } = {}) {
  const element    = resolveElement(spec); if (!element) return false;
  const rect       = element.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewWidth  = window.innerWidth  || document.documentElement.clientWidth;
  const visibleY   = Math.min(rect.bottom, viewHeight) - Math.max(rect.top,  0);
  const visibleX   = Math.min(rect.right,  viewWidth)  - Math.max(rect.left, 0);
  if (visibleY <= 0 || visibleX <= 0) return false;

  const covered = (visibleY * visibleX) / (rect.height * rect.width || 1);
  return covered >= ratio;
}

export default isElementInViewport;
