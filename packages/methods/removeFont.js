// removeFont.js

import { getFonts } from './getFonts.js';

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

export function removeFont (...families) {
  const fonts = fontSet();
  if (!fonts) return [];

  const removed = [];
  for (const family of families.flat(Infinity)) {
    for (const face of getFonts(family)) { fonts.delete(face); removed.push(face); }
  }
  return removed;
}

export default removeFont;
