// @domina/core/dispose.js

import { isFn } from './internal/is.js';

// collects disposers so a component only has to keep one handle
export const disposer = () => {
  const entries = new Set;
  return {
    add      (stop) { if (isFn(stop)) entries.add(stop); return stop; },
    dispose  ()     { for (const stop of entries) { try { stop(); } catch {} } entries.clear(); },
    get size ()     { return entries.size; }
  };
};
