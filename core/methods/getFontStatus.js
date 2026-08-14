// getFontStatus.js

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

// 'loading' | 'loaded'
export function getFontStatus () { return fontSet()?.status ?? 'loaded'; }

export default getFontStatus;
