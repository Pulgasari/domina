// insertAfter.js

import { moveTo } from './moveTo.js';

export function insertAfter (spec, target) { return moveTo(spec, target, 'after'); }

export default insertAfter;
