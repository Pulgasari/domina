// hasFont.js

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

// document.fonts.check() requires '<size> <family>', not just family name
const asSpec = spec => /^\d/.test(spec.trim()) ? spec : `1em ${spec}`;

export function hasFont (spec) { return fontSet()?.check(asSpec(spec)) ?? false; }

export default hasFont;
