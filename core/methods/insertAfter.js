// insertAfter.js

import { moveTo } from './moveTo.js';

export const insertAfter = (spec, target) => moveTo(spec, target, 'after');

export default insertAfter;
