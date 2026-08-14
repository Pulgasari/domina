// @ts-self-types="./types.d.ts"
// @domina/core

export * from './methods/index.js';

/*
  guarded because this barrel is reachable from non-dom scopes. an unguarded
  `document` here is a ReferenceError at module evaluation time in a worker, and
  that failure takes down everything importing it — a service worker that hits it
  does not install at all, silently, with nothing in the page's console.

  see ./fonts.js for the same pattern applied to document.fonts.
*/
const hasDocument = typeof document !== 'undefined';

export const
root = hasDocument ? document.documentElement : null,
body = hasDocument ? document.body            : null;

//export * from './sugar/index.js';

/*
export * from './query.js';
export * from './element.js';
export * from './create.js';

export * from './attr.js';
export * from './class.js';
export * from './data.js';
export * from './content.js';
export * from './values.js';
export * from './style.js';

export * from './traverse.js';
export * from './insert.js';
export * from './geometry.js';

export * from './head.js';
export * from './meta.js';
export * from './fonts.js';
export * from './stylesheet.js';

export * from './events.js';
export * from './observer.js';
export * from './raf.js';
export * from './dispose.js';

export * from './form.js';
export * from './collection/index.js';
*/
