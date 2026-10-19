// updateLink.js

import { upsertHead }    from './upsertHead.js';
import { updateElement } from './updateElement.js';

/**
 * updateLink({ rel: 'stylesheet', href: '/app.css' })
 * Identifies via rel + href, making it idempotent.
 */
export function updateLink (spec = {}) {
  const rel  = spec.rel ?? 'stylesheet';
  const href = spec.href ?? '';
  const element = upsertHead(
    `link[rel="${rel}"]${href ? `[href="${href}"]` : ''}`,
    () => document.createElement('link')
  );
  return updateElement(element, { rel, ...spec });
}

export default updateLink;
