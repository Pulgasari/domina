// eachFont.js

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

export const eachFont = callback => { fontSet()?.forEach(callback); };

export default eachFont;
