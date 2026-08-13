// getFontStatus.js

const fontSet = () => (typeof document !== 'undefined' ? document.fonts : null);

// 'loading' | 'loaded'
export const getFontStatus = () => fontSet()?.status ?? 'loaded';

export default getFontStatus;
