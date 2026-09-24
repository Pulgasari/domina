// @ts-self-types="./types.d.ts"
// @domina/core

export * from '@domina/methods';
export * from './observer.js';
export * from './raf.js';
export * from './sugar/index.js'; 

export const
hasDocument = typeof document !== 'undefined',
root = hasDocument ? document.documentElement : null,
body = hasDocument ? document.body            : null;

