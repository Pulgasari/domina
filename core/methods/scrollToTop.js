// scrollToTop.js

// First argument is top (number) or options object. Target is always page top.
export const scrollToTop = (arg = {}) => {
  const { top = 0, behavior = 'smooth' } = typeof arg === 'number' ? { top: arg } : arg;
  window.scrollTo({ top, behavior });
  return window;
};

export default scrollToTop;
