// createTemplate.js

//import createElement from './createElement.js';

export default const createTemplate = (html, props = {}) => {
  const element = document.createElement('template');
  
  return updateElement(element, { 
    innerHTML: String(html ?? '').trim(), 
    ...props 
  });
}
