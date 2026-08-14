// loadFont.js

const fontSet = ()   => (typeof document !== 'undefined' ? document.fonts : null);
const asSpec  = spec => /^\d/.test(spec.trim()) ? spec : `1em ${spec}`;

// -> Promise<FontFace[]>, resolves once matching faces are loaded
export function loadFont (spec, text) { return fontSet()?.load(asSpec(spec), text) ?? Promise.resolve([]); }

export default loadFont;
