// createTemplate.js

import { updateElement } from './updateElement.js';

export function createTemplate (html, props = {}) {
  const element = document.createElement('template');
  
  return updateElement(element, { 
    innerHTML: String(html ?? '').trim(), 
    ...props 
  });
}

export default createTemplate;
