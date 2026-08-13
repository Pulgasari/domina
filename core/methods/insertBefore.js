// insertBefore.js

import { moveTo } from './moveTo.js';

export const insertBefore = (spec, target) => moveTo(spec, target, 'before');

export default insertBefore;
