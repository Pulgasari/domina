// @domina/core/fonts.js

export {
  addFont,
  eachFont,
  fontsReady,
  getFontStatus,
  hasFont,
  loadFont,
  getFonts,
  removeFont,
} from './methods/index.js';

/*
export addFont from './methods/index.js';
export hasFont from './methods/index.js';
export loadFont from './methods/index.js';
export getFonts from './methods/index.js';
export removeFont from './methods/index.js';
export fontsReady from './methods/index.js';
export getFontStatus from './methods/index.js';
export eachFont from './methods/index.js';
*/

/*
import { isString } from './internal/is.js';

// überflüssig? -> document?.fonts
// oder besserer name
const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

// document.fonts.check() will '<size> <family>', nicht nur die Familie
const asSpec = spec => /^\d/.test(spec.trim()) ? spec : `1em ${spec}`;

// 'Inter' -> 'url(Inter)' ist falsch, '/f.woff2' -> 'url(/f.woff2)' ist richtig
const asSource = source => isString(source) && !source.includes('url(') ? `url(${source})` : source;



export {} from './methods/index.js';

export const

addFont = (family, source, descriptors = {}) => {
  const fonts = fontSet();
  if (!fonts) return null;

  const face = source instanceof FontFace
    ? source
    : new FontFace(family, asSource(source), descriptors);

  fonts.add(face);
  return face;
},

// hasFont('Inter') oder hasFont('bold 16px Inter')
hasFont = spec => fontSet()?.check(asSpec(spec)) ?? false,

// -> Promise<FontFace[]>, resolved sobald die passenden Faces geladen sind
loadFont = (spec, text) => fontSet()?.load(asSpec(spec), text) ?? Promise.resolve([]),

// getFonts()        -> alle registrierten FontFaces
// getFonts('Inter') -> nur die dieser Familie
getFonts = family => {
  const fonts = fontSet();
  if (!fonts) return [];
  const all = [...fonts];
  return family ? all.filter(face => face.family.replace(/^['"]|['"]$/g, '') === family) : all;
},

removeFont = (...families) => {
  const fonts = fontSet();
  if (!fonts) return [];

  const removed = [];
  for (const family of families.flat(Infinity)) {
    for (const face of getFonts(family)) { fonts.delete(face); removed.push(face); }
  }
  return removed;
},

// -> Promise<FontFaceSet>, wenn alle laufenden Ladungen durch sind
fontsReady = () => fontSet()?.ready ?? Promise.resolve(null),

// 'loading' | 'loaded'
getFontStatus = () => fontSet()?.status ?? 'loaded',

eachFont = callback => { fontSet()?.forEach(callback); };
*/
