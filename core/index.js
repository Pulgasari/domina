// @ts-self-types="./types.d.ts"
// @domina/core

/*
  zwei ebenen:
  methods/  — zustandslose einzelfunktionen, eine datei pro export, barrel generiert
  *.js      — subsysteme mit eigenem modulstate (observer, raf) und die geteilte
              infrastruktur (shared.js, nicht exportiert)
*/

export * from './methods/index.js';
export * from './observer.js';
export * from './raf.js';

/*
  guarded because this barrel is reachable from non-dom scopes. an unguarded
  `document` here is a ReferenceError at module evaluation time in a worker, and
  that failure takes down everything importing it — a service worker that hits it
  does not install at all, silently, with nothing in the page's console.

  see methods/addFont.js and its neighbours for the same pattern applied to
  document.fonts.
*/
const hasDocument = typeof document !== 'undefined';

export const
root = hasDocument ? document.documentElement : null,
body = hasDocument ? document.body            : null;

//export * from './sugar/index.js';
