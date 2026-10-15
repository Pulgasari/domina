// @domina/chain

export type Target = Element | Document | Window;

/** A selector, a target, a chain, or any iterable of those. */
export type Spec = string | Target | Chain | Iterable<string | Target | Chain> | null | undefined;

/** What a getter answers: the first element's value, or every element's on `.all` / `dd()`. */
type Read<T, Many extends boolean> = Many extends true ? T[] : T | null;

export interface Size { w: number; h: number; }
export type Box = 'border' | 'content' | 'scroll';

export type Handler = (event: Event, element: Element) => void;

/** A new value, or a function of the old one: `(old, element, index) => value`. */
type Value<T> = T | null | ((old: T | null, element: Element, index: number) => T | null);

export declare class Chain<Many extends boolean = false> implements Iterable<Target> {
  constructor(elements: Target[], many?: Many);

  readonly elements: Target[];
  readonly many: Many;
  readonly length: number;
  /** The first element, or `null`. */
  readonly el: Target | null;
  /** The same set, its getters answer for every element. */
  readonly all: Chain<true>;

  [Symbol.iterator](): Iterator<Target>;
  each(callback: (element: Target, index: number) => void): this;
  map<T>(callback: (element: Target, index: number) => T): T[];

  // :::::: attributes

  attr(): Read<Record<string, string>, Many>;
  attr(name: string): Read<string, Many>;
  /** `true` sets an empty attribute, `false` and `null` remove it. `aria-*` keys follow `aria()`. */
  attr(name: string, value: Value<string | number | boolean>): this;
  attr(map: Record<string, string | number | boolean | null>): this;

  /** Every `aria-*` attribute, keys without the prefix in camelCase. */
  aria(): Read<Record<string, string>, Many>;
  /** The prefix is optional: `'expanded'`, `'ariaExpanded'`, `'aria-expanded'`. */
  aria(name: string): Read<string, Many>;
  /** `true`/`false` become `'true'`/`'false'`, a list is joined with spaces, `null` removes. */
  aria(name: string, value: Value<string | number | boolean | string[]>): this;
  aria(map: Record<string, string | number | boolean | string[] | null>): this;

  /** `dataset` as it is: strings, nothing is cast. */
  data(): Read<Record<string, string>, Many>;
  data(name: string): Read<string, Many>;
  /** `true` is an empty attribute, `false` and `null` remove, objects and lists are stored as json. */
  data(name: string, value: Value<string | number | boolean | object>): this;
  data(map: Record<string, string | number | boolean | object | null>): this;
  /** Alias of `data`. */
  dataset: Chain<Many>['data'];

  // :::::: content

  html(): Read<string, Many>;
  html(html: string): this;

  // :::::: styles

  /** The computed value. */
  style(property: string): Read<string, Many>;
  /** Numbers get `px`, except unitless properties. `null` removes the inline property. */
  style(property: string, value: Value<string | number>): this;
  style(map: Record<string, string | number | null>): this;

  // :::::: geometry

  size(options?: { box?: Box }): Read<Size, Many>;
  /** Writes the css properties width and height, only what is given. */
  size(size: { w?: number | string | null; h?: number | string | null }): this;

  // :::::: events

  on(types: string, handler: Handler, options?: AddEventListenerOptions): this;
  /** Delegated: `element` is the descendant matching `selector`. */
  on(types: string, selector: string, handler: Handler, options?: AddEventListenerOptions): this;
  once(types: string, handler: Handler, options?: AddEventListenerOptions): this;
  once(types: string, selector: string, handler: Handler, options?: AddEventListenerOptions): this;
  /** Removes listeners added through any chain on these elements: all, by type, or by handler. */
  off(types?: string, handler?: Handler): this;
  /** Dispatches a `CustomEvent`, bubbling by default. */
  emit(type: string, detail?: unknown, options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }): this;

  [method: string]: any;
}

/** A method, described as data. */
export interface Definition {
  read?: (element: Target, ...args: any[]) => unknown;
  write?: (element: Target, ...args: any[]) => unknown;
  /** Which of the two a call means. Default: no argument, or one that is not a plain object. */
  reads?: (args: unknown[]) => boolean;
  /** Anything else, called with the chain as `this`. */
  method?: (this: Chain<boolean>, ...args: any[]) => unknown;
  /** The arguments in order, name -> type. Read by docs and tooling. */
  params?: Record<string, string>;
  /** `params` are the keys of one object argument. */
  object?: boolean;
  kind?: string;
}

export interface Entry extends Definition {
  name: string;
  kind: 'access' | 'read' | 'write' | 'method' | string;
  params: Record<string, string>;
}

/** A bare function is a setter, called as `(element, ...args)` on every element. */
export type Extension = Definition | ((element: Target, ...args: any[]) => unknown);

export interface D {
  (spec?: Spec, context?: Spec): Chain;
  all: typeof dd;
  /** Every method, built-in and added, by name. */
  api: Map<string, Entry>;
  /** Throws when the name exists. */
  define(name: string, definition: Extension): void;
  extend(definitions: Record<string, Extension>): void;
}

export declare const d: D;
export declare function dd(spec?: Spec, context?: Spec): Chain<true>;
export declare const api: Map<string, Entry>;
export declare function define(name: string, definition: Extension): void;
export declare function extend(definitions: Record<string, Extension>): void;

/** Adds listeners for every type, delegated when `selector` is given. Returns one disposer. */
export declare function listen(target: EventTarget, types: string, selector: string | null, handler: Handler, options?: AddEventListenerOptions, flags?: { once?: boolean }): () => void;
/** `'click keydown'` or `'click, keydown'` -> `['click', 'keydown']`. */
export declare function typesOf(types: string | null | undefined): string[];
/** Removes what `listen` added on `target`: all, by types, or by handler. */
export declare function unlisten(target: EventTarget, types?: string, handler?: Handler): void;

export default d;
