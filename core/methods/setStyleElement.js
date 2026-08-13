// @domina/core/methods/setStyleElement.js

import updateElement from './updateElement.js';
import upsertHead    from './upsertHead.js';
import { isString }  from './internal/is.js';
import { _el }       from './internal/resolve.js';

/**
 * setStyleElement(css)                   -> anonymes <style>, jedes Mal neu
 * setStyleElement(css, { id: 'theme' })  -> idempotent, ersetzt den Inhalt
 * setStyleElement(null, { id: 'theme' }) -> entfernt
 */
export default const setStyleElement = (css, { id, media } = {}) => {
  if (css === null && id) {
    document.getElementById(id)?.remove();
    return null;
  }

  const element = id
    ? upsertHead(`style#${id}`, () => updateElement(document.createElement('style'), { id }))
    : updateElement(document.createElement('style'), { appendTo: document.head });

  element.textContent = String(css ?? '');
  if (media) element.media = media;
  return element;
};
