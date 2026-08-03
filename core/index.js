// @ts-self-types="./types.d.ts"
// @domina/core

export * from './create.js';
export * from './events.js';
export * from './form.js';
export * from './misc.js';
export * from './observer.js';
export * from './query.js';
export * from './raf.js';
export * from './update.js';
export * from './values.js';
export * from './collection/index.js';

// Aliase
export { 
  element  : getElement, 
  elements : getElements,
} from './src/query.js';
