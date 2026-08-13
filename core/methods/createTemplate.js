// createTemplate.js

//import createElement from './createElement.js';

export const createTemplate = (html, props = {}) => {
  const element = document.createElement('template');
  
  return updateElement(element, { 
    innerHTML: String(html ?? '').trim(), 
    ...props 
  });
};

export default createTemplate;
