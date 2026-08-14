// getParent.js

import { _el, _slct } from './../resolve.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

export const getParent = (spec, filter) => {
  const parent = _el(spec)?.parentElement ?? null;
  return parent && passes(parent, filter) ? parent : null;
};

export default getParent;
