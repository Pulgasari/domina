// setTitle.js

import { upsertHead } from './upsertHead.js';

export const setTitle = title => {
  const element = upsertHead('title', () => document.createElement('title'));
  element.textContent = String(title ?? '');
  return element;
};

export default setTitle;
