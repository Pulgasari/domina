// setLink.js

import { updateElement } from './updateElement.js';
import { upsertHead }    from './upsertHead.js';

export function setLink (spec = {}) {
  const { href = '', rel = 'stylesheet' } = spec;
  
  const element = upsertHead(
    `link[rel="${rel}"]${href ? `[href="${href}"]` : ''}`,
    () => document.createElement('link')
  );
  
  return updateElement (element, { rel, ...spec });
}

export default setLink;
