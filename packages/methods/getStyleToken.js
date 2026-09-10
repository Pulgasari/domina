// getStyleToken.js

import getComputedStyle from './getComputedStyle.js';
     
const ensurePrefix = (value, prefix) => value.startsWith(prefix) ? value : (prefix + value);     

export function getStyleToken (property, spec, inline = false) {
  spec ||= document.documentElement;

  const prop  = ensurePrefix(property, '--');
  const style = getComputedStyle(spec);
  const token = style?.getPropertyValue(prop).trim() || null;

  return token;
}

export default getStyleToken;





