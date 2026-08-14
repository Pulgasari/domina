// eachFont.js

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

export function eachFont (callback) { fontSet()?.forEach(callback); }

export default eachFont;
