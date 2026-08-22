// @domina/core/sugar/fonts.js

import {
  addFont,
  eachFont,
  fontsReady,
  getFontStatus,
  getFonts,
  hasFont,
  loadFont,
  removeFont
} from './../methods/index.js';    

/**
 * font('Inter')
 *   .add('/fonts/inter.woff2', { weight: '400', display: 'swap' })
 *   .load()          -> Promise<FontFace[]>
 *   .has()           -> ist die Familie einsatzbereit
 *   .faces           -> alle registrierten FontFaces dieser Familie
 *   .remove()
 * Die Familie wird bei jedem Aufruf mitgeführt, statt sie überall zu wiederholen.
 */
export const font = family => {
  const handle = {
    family,
    get faces  () { return getFonts(family); },
    get loaded () { return hasFont(family); },

    add    : (source, descriptors) => { addFont(family, source, descriptors); return handle; },
    load   : (size = '1em', text)  => loadFont(`${size} ${family}`, text),
    has    : (size)                => hasFont(size ? `${size} ${family}` : family),
    remove : ()                    => { removeFont(family); return handle; },
  };
  return handle;
};

/** Der Zugang zu document.fonts, ohne dass man sich die Property merken muss. */
export const fonts = {
  add    : addFont,
  has    : hasFont,
  load   : loadFont,
  remove : removeFont,
  each   : eachFont,
  
  get families () { return [...new Set(getFonts().map(face => face.family.replace(/^['"]|['"]$/g, '')))]; },   
  get list     () { return getFonts(); },
  get ready    () { return fontsReady(); },
  get status   () { return getFontStatus(); },
};
