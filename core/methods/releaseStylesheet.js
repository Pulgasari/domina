// releaseStylesheet.js

import { isString }        from './../vendors.js';
import { rootOf, storeOf } from './adoptStylesheet.js';

/** Removes a sheet again. Accepts the sheet itself or the key it was cached under. */
export const releaseStylesheet = async (sheetOrKey, { target = document } = {}) => {
  const root  = rootOf(target);
  const store = storeOf(root);

  let sheet = sheetOrKey;
  if (isString(sheetOrKey)) {
    sheet = await store.get(sheetOrKey);
    store.delete(sheetOrKey);
  } else {
    for (const [key, pending] of store) if (await pending === sheet) store.delete(key);
  }

  if (!sheet) return false;
  root.adoptedStyleSheets = root.adoptedStyleSheets.filter(adopted => adopted !== sheet);
  return true;
};

export default releaseStylesheet;
