// fontsReady.js

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

// -> Promise<FontFaceSet>, resolved when all ongoing font loadings are finished
export function fontsReady () { return fontSet()?.ready ?? Promise.resolve(null); }

export default fontsReady;
