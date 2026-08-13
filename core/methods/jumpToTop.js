// jumpToTop.js

import { scrollToTop } from './scrollToTop.js';

export const jumpToTop = (arg = {}) => {
  const opts = typeof arg === 'number' ? { top: arg } : arg;
  return scrollToTop({ behavior: 'auto', ...opts });
};

export default jumpToTop;
