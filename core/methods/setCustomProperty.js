// setCustomProperty.js

import { isString } from './../shared.js';
import { setStyle } from './setStyle.js';

export function setCustomProperty (spec, nameOrMap, value) {
  const map = isString(nameOrMap) ? { [nameOrMap]: value } : nameOrMap;
  const prefixed = {};
  for (const [name, val] of Object.entries(map ?? {})) {
    prefixed[name.startsWith('--') ? name : `--${name}`] = val;
  }
  return setStyle(spec, prefixed);
}

export default setCustomProperty;
