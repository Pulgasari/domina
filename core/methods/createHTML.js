// createHTML.js

//import createElement from './createElement.js';

// -> DocumentFragment. Der Umweg über <template> parst auch <tr> und <option>
// korrekt, die in einem beliebigen Container still verworfen würden.

export default const createHTML = html => {
  const template = document.createElement('template');
  template.innerHTML = String(html).trim();
  return template.content;
}
