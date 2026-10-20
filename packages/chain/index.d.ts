// @domina/chain

export type Target = Element | Document | Window;

/** A selector, a target, a chain, or any iterable of those. */
export type Spec = string | Target | Chain | Iterable<string | Target | Chain> | null | undefined;

/** What a getter answers: the first element's value, or every element's on `.all` / `dd()`. */
type Read<T, Many extends boolean> = Many extends true ? T[] : T | null;

export interface Size { w: number; h: number; }
export type Box = 'border' | 'content' | 'scroll';

export type Handler = (event: Event, element: Element) => void;

export type Content = string | Node | Chain<boolean> | null | false | ((element: Element, index: number) => Content | Content[]);

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

  /** Typed: reads are cast (`'42'` -> `42`, `'true'` -> `true`, json -> object), writes encoded to read back the same. `null` removes. */
  data(): Read<Record<string, unknown>, Many>;
  /** The prefix is optional: `'fooBar'`, `'foo-bar'`, `'dataFooBar'`, `'data-foo-bar'`. Same for `dataset()`. */
  data(name: string): Read<unknown, Many>;
  data(name: string, value: Value<unknown>): this;
  data(map: Record<string, unknown>): this;

  /** As the dom has it: strings in, strings out. `null` removes. */
  dataset(): Read<Record<string, string>, Many>;
  dataset(name: string): Read<string, Many>;
  dataset(name: string, value: Value<string>): this;
  dataset(map: Record<string, string | null>): this;

  // :::::: classes

  /** Names: `'a b'`, `'a, b'`, a list, or `{ a: true, b: false }`. */
  addClass(...names: Array<string | string[] | Record<string, unknown>>): this;
  removeClass(...names: Array<string | string[] | Record<string, unknown>>): this;
  toggleClass(names: string | string[] | Record<string, unknown>, force?: boolean): this;
  /** Every name present. */
  hasClass(names: string | string[]): Read<boolean, Many>;
  /** The whole class list; writing replaces it. */
  class(): Read<string[], Many>;
  class(names: string | string[] | Record<string, unknown>): this;

  // :::::: content

  html(): Read<string, Many>;
  html(html: string): this;
  text(): Read<string, Many>;
  text(text: Value<string | number>): this;

  // :::::: forms

  /** checkbox: boolean, select multiple: array, otherwise a string. */
  value(): Read<unknown, Many>;
  value(value: unknown, options?: { notify?: boolean }): this;

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

  // :::::: structure
  // content: a string (as text), a node or chain (only for a set of one), or (element, index) => content

  append(...content: Content[]): this;
  prepend(...content: Content[]): this;
  before(...content: Content[]): this;
  after(...content: Content[]): this;
  /** At an index among the children, negative from the end. */
  insert(index: number, ...content: Content[]): this;
  /** The set moves into the first target. */
  appendTo(target: Spec): this;
  prependTo(target: Spec): this;
  /** The replacements. */
  replace(...content: Content[]): Chain<Many>;
  /** Every element into its own wrapper. Returns the wrappers, so `unwrap()` undoes it. */
  wrap(wrapper?: string | ((element: Element, index: number) => Element), props?: Record<string, unknown>): Chain<Many>;
  /** Dissolves every element; returns the children that took its place. */
  unwrap(): Chain<Many>;
  clear(): this;
  /** Out of the document; the chain keeps them. */
  remove(): this;
  clone(deep?: boolean): Chain<Many>;
  /** Every element is a container: sorts its items by indicators (`'.price'`, `['.price', 'num-desc']`, a compare function). */
  sort(item: string, ...indicators: Array<string | [string, string] | ((a: unknown, b: unknown) => number)>): this;

  // :::::: traversal: a new chain, deduplicated, in document order

  find(selector: string): Chain<Many>;
  closest(selector: string | Record<string, unknown>): Chain<Many>;
  children(filter?: string): Chain<Many>;
  parent(filter?: string): Chain<Many>;
  parents(filter?: string): Chain<Many>;
  siblings(filter?: string): Chain<Many>;
  next(filter?: string): Chain<Many>;
  prev(filter?: string): Chain<Many>;
  nextAll(filter?: string): Chain<Many>;
  prevAll(filter?: string): Chain<Many>;
  filter(test: string | ((element: Target, index: number) => boolean)): Chain<Many>;
  not(test: string | ((element: Target, index: number) => boolean)): Chain<Many>;
  /** Elements that contain a match. */
  has(selector: string): Chain<Many>;
  at(index: number): Chain<Many>;
  first(): Chain<Many>;
  last(): Chain<Many>;
  slice(start?: number, end?: number): Chain<Many>;
  /** Does any element match. */
  is(selector: string | ((element: Target) => boolean)): boolean;
  /** Position among the element siblings, `-1` if none. */
  index(): Read<number, Many>;

  // :::::: view

  /** In the document. */
  offset(): Read<{ x: number; y: number }, Many>;
  /** In the offset parent. */
  position(): Read<{ x: number; y: number }, Many>;
  /** In the viewport. */
  rect(): Read<DOMRect, Many>;
  inView(ratio?: number): Read<boolean, Many>;
  /** The first element comes into view, smooth. */
  scrollTo(options?: ScrollIntoViewOptions): this;
  jumpTo(options?: ScrollIntoViewOptions): this;
  /** Every running animation and transition of the set, then the chain. */
  finished(name?: string): Promise<this>;
  /** The next event of this type on the first element. */
  wait(type: string, timeout?: number): Promise<Event>;

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
