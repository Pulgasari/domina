import adoptStyleSheet   from '@domina/verbs/adoptStyleSheet.js';
import releaseStyleSheet from '@domina/verbs/releaseStyleSheet.js';

import { getConfig, onConfigChange, setConfig } from './config.js';
import { ensureLayerOrder, SKIN_LAYER }         from './styles.js';

const CONFIG_KEY   = 'elements-skin';
const DEFAULT_SKIN = 'monochrome';
// the skins are @gestalt/css's, from where @gestalt/core loads its sheets as well. not
// relative to this module: in a build it sits in a chunk of its own
const SKIN_BASE    = 'https://code.pulgasari.dev/gestalt/packages/css/skins/';
const SKIN_KEY     = 'aufbau:skin';

const skinUrl = (skin) =>
  /^(https?:|\/|\.)/.test(skin) ? new URL(skin, location.href).href
                                : new URL(`${skin}.css`, SKIN_BASE).href;

let current   = undefined;
let listening = false;

function applySkin (skin = getConfig(CONFIG_KEY, DEFAULT_SKIN)) {
  if (!listening) {
    listening = true;
    onConfigChange(() => applySkin());
  }

  const next = skin === 'none' || skin === 'off' ? null : skin || null;
  if (next === current) return;

  const previous = current;
  current = next;

  ensureLayerOrder();

  if (next)     return adoptStyleSheet(skinUrl(next), { key: SKIN_KEY, layer: SKIN_LAYER, replace: previous != null });
  if (previous) return releaseStyleSheet(SKIN_KEY);
}

function setSkin (skin) {
  setConfig(CONFIG_KEY, skin ?? 'none');
  return applySkin();
}

export { applySkin, setSkin };
