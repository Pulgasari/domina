// @ts-self-types="./observer.d.ts"
// @domina/prototype/observer

// opt-in: the observer props of @domina/observer for update and createElement.
// onConnected, onDisconnected, onVisible, onResize get the element, onAdded, onRemoved
// and onAttr watch its subtree / attributes

import { defineProps } from './index.js';
import { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible } from '@domina/observer';

defineProps({ onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible });
