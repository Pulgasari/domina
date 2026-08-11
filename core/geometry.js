// @domina/core/geometry.js

import { _el } from './internal/resolve.js';
import { isWindow } from './internal/is.js';

// Lesen loest Layout aus. Wer viele Elemente hintereinander misst, packt die
// Aufrufe in measure() aus raf.js – dann rechnet der Browser einmal pro Frame.
const scrollRoot = spec => !spec || isWindow(spec) || spec === document ? null : _el(spec);

export const

getRect = spec => _el(spec)?.getBoundingClientRect() ?? null,

/**
 * getSize(spec)                    -> Border-Box inklusive Rahmen und Padding
 * getSize(spec, { box: 'content' })-> Content-Box, also clientWidth/Height
 * getSize(spec, { box: 'scroll' }) -> volle Scroll-Ausdehnung
 */
getSize = (spec, { box = 'border' } = {}) => {
  const element = _el(spec); if (!element) return null;

  if (box === 'content') return { width: element.clientWidth, height: element.clientHeight };
  if (box === 'scroll')  return { width: element.scrollWidth, height: element.scrollHeight };

  const rect = element.getBoundingClientRect();
  return { 
    width  : rect.width, 
    height : rect.height 
  };
},

// Relativ zum Dokument – überlebt Scrollen, im Gegensatz zum Rect
getOffset = spec => {
  const element = _el(spec); if (!element) return null;
  const rect    = element.getBoundingClientRect();
  return { 
    top  : rect.top  + window.scrollY, 
    left : rect.left + window.scrollX 
  };
},

// Relativ zum offsetParent – das, was man für absolute Positionierung braucht
getPosition = spec => {
  const element = _el(spec); if (!element) return null;
  return {
    top  : element.offsetTop, 
    left : element.offsetLeft 
  };
},

getOffsetParent = spec => _el(spec)?.offsetParent ?? null,

// Ohne Argument oder mit window/document: die Seite selbst
getScroll = spec => {
  const element = scrollRoot(spec);
  return element
    ? { top: element.scrollTop, left: element.scrollLeft }
    : { top: window.scrollY,    left: window.scrollX };
},

setScroll = (spec, { top, left, behavior = 'auto' } = {}) => {
  const target = scrollRoot(spec) ?? window;
  const options = { behavior };
  if (top  != null) options.top  = top;
  if (left != null) options.left = left;

  target.scrollTo(options);
  return target;
},

// smooth als default; block/inline nearest wie gehabt. jumpTo ist derselbe
// aufruf ohne scroll-animation.
scrollTo = (spec, options = {}) => {
  const element = _el(spec);
  element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest', ...options });
  return element;
},

jumpTo = (spec, options = {}) => scrollTo(spec, { behavior: 'auto', ...options }),

// erstes arg ist top (zahl) oder options. ziel ist immer der seitenanfang.
scrollToTop = (arg = {}) => {
  const { top = 0, behavior = 'smooth' } = typeof arg === 'number' ? { top: arg } : arg;
  window.scrollTo({ top, behavior });
  return window;
},

jumpToTop = (arg = {}) => {
  const opts = typeof arg === 'number' ? { top: arg } : arg;
  return scrollToTop({ behavior: 'auto', ...opts });
},

/** ratio: 0 = ein Pixel reicht, 1 = das Element muss vollständig sichtbar sein */
isInViewport = (spec, { ratio = 0 } = {}) => {
  const element    = _el(spec); if (!element) return false;
  const rect       = element.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewWidth  = window.innerWidth  || document.documentElement.clientWidth;
  const visibleY   = Math.min(rect.bottom, viewHeight) - Math.max(rect.top,  0);
  const visibleX   = Math.min(rect.right,  viewWidth)  - Math.max(rect.left, 0);
  if (visibleY <= 0 || visibleX <= 0) return false;

  const covered = (visibleY * visibleX) / (rect.height * rect.width || 1);
  return covered >= ratio;
};
