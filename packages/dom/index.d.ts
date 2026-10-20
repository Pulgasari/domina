// @domina/dom

import type { Chain, Spec } from '@domina/chain';
import type { Domina } from '@domina/proxy';

/** @domina/proxy for document, and callable as d() of @domina/chain. */
export type Dom = Domina & ((spec?: Spec, context?: Spec) => Chain);

export declare const dom : Dom;
export { d, dd } from '@domina/chain';

export default dom;
