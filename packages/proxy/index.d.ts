// @domina/proxy

/** A selector, or a spec object: `tag`, `id`, `class`, `dataset`, any other key as an attribute. */
export type Selector = string | Record<string, unknown>;

/** A test for List: a function, a selector, or a matcher object (every key has to match). */
export type Matcher<T = Element> = ((element: T, index: number) => unknown) | string | Record<string, unknown>;

/** An array whose tests take a matcher object or a selector as well. */
export declare class List<T = Element> extends Array<T> {
  every     (test: Matcher<T>, self?: unknown): boolean;
  filter    (test: Matcher<T>, self?: unknown): List<T>;
  find      (test: Matcher<T>, self?: unknown): T | undefined;
  findIndex (test: Matcher<T>, self?: unknown): number;
  findLast  (test: Matcher<T>, self?: unknown): T | undefined;
  some      (test: Matcher<T>, self?: unknown): boolean;
}

export type Disposer = () => void;

export interface Media {
  readonly coarse : boolean;
  readonly dark   : boolean;
  readonly hover  : boolean;
  readonly light  : boolean;
  readonly print  : boolean;
  matches (query: string): boolean;
  /** On a change of the query, returns its stop. */
  on (query: string, fn: (matches: boolean, event: MediaQueryListEvent) => void): Disposer;
}

/** The preferences of the user that a page has to respect. */
export interface A11y {
  readonly contrast            : boolean;
  readonly forcedColors        : boolean;
  readonly reducedMotion       : boolean;
  readonly reducedTransparency : boolean;
}

/** The <meta> elements: a value per key (null without one), a namespace per known prefix (og, twitter …). null removes. */
export type Meta = Record<string, any>;

export interface Members {
  /** A spec object fills the gap. */
  querySelector    (selector: Selector): Element | null;
  querySelectorAll (selector: Selector): NodeListOf<Element>;
  getElement       (selector: Selector, context?: unknown): Element | null;
  getElements      (selector: Selector, context?: unknown): List<Element>;
  get              (selector: Selector, context?: unknown): Element | null;
  getList          (selector: Selector, context?: unknown): List<Element>;
  /** Props and children fill the gap. A string or `{ is }` alone stay native. */
  createElement (tag: string, props?: string | ElementCreationOptions | Record<string, unknown>, ...children: unknown[]): HTMLElement;
  /** Several types, delegation with a selector, and a disposer back. */
  addEventListener (types: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Disposer;
  addEventListener (types: string, selector: string, handler: (this: Element, event: Event, match: Element) => unknown, options?: boolean | AddEventListenerOptions): Disposer;
  /** Without a listener: every listener added through domina for these types. */
  removeEventListener (types: string, listener?: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

  /** The element of the facade: <html> for the document. */
  readonly root     : Element;
  readonly meta     : Meta;
  /** The url of the page as @pulgasari/url, a copy. */
  readonly url      : unknown;
  readonly observer : typeof import('@domina/observer');
  readonly a11y     : A11y;
  readonly media    : Media;

  within (root: string | Element | ShadowRoot | Document): Domina;
  extend (definitions: Record<string, unknown>): void;
}

/** Reads like document (or the element / shadow root of within()), with the members on top. */
export type Domina = Members & Omit<Document, keyof Members>;

export declare const domina : Domina;
export declare const a11y   : A11y;
export declare const media  : Media;
export declare const meta   : Meta;

export declare function within (root: string | Element | ShadowRoot | Document): Domina;
export declare function extend (definitions: Record<string, unknown>): void;
export declare function matcherOf<T = Element> (test: Matcher<T>): (element: T) => boolean;

export default domina;
