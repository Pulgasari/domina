// insertBefore.js

import { moveTo } from './moveTo.js';

export function insertBefore (spec, target) { return moveTo(spec, target, 'before'); }

export default insertBefore;
