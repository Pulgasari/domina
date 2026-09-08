// getCustomProperty.js

import { getStyle } from './getStyle.js';

// Custom properties require getPropertyValue - element.style['--x'] does not work
export function getCustomProperty (spec, name, inline = false) {
  return getStyle(spec, name.startsWith('--') ? name : `--${name}`, inline);
}

export default getCustomProperty;
