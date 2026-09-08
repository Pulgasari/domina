// getStyleToken.js

import getComputedStyle from './getComputedStyle.js';
     
const ensurePrefix = (value, prefix) => value.startsWith(prefix) ? value : (prefix + name);     

export function getStyleToken (property, spec, inline = false) {
  spec ||= document.documentElement;

  const prop  = ensurePrefix(property, '--');
  const style = getComputedStyle(spec);
  const token = style?.getPropertyValue(prop).trim() || null;

  console.log('property:', property);
  console.log('prop:', prop);
  console.log('token:', token);

  return token;
}

export default getStyleToken;





