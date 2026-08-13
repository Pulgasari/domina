// getFonts.js

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

// getFonts()        -> all registered FontFaces
// getFonts('Inter') -> only faces matching this family
export const getFonts = family => {
  const fonts = fontSet();
  if (!fonts) return [];
  const all = [...fonts];
  return family ? all.filter(face => face.family.replace(/^['"]|['"]$/g, '') === family) : all;
};

export default getFonts;
