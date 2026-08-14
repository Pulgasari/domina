// addFont.js

import { isString } from './../vendors.js';

const fontSet  = ()     => (typeof document !== 'undefined' ? document.fonts : null);
const asSource = source => isString(source) && !source.includes('url(') ? `url(${source})` : source;

/**
 * addFont('Inter', '/fonts/inter.woff2', { weight: '400', display: 'swap' })
 * addFont('Inter', new FontFace(…)) -> passes through existing FontFace
 * -> FontFace | null
 */
export function addFont (family, source, descriptors = {}) {
  const fonts = fontSet();
  if (!fonts) return null;

  const face = source instanceof FontFace
    ? source
    : new FontFace(family, asSource(source), descriptors);

  fonts.add(face);
  return face;
}

export default addFont;
