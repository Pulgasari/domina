// @domina/proxy

import type { Chain, Handler, Spec } from '@domina/chain';

/** A selector, or a spec object: `tag`, `id`, `class`, `dataset`, any other key as an attribute. */
export type Selector = string | Record<string, unknown>;

/** A namespace: read, write (`null` removes), `delete`, `in`, `Object.keys()`. */
export type Space<T> = Record<string, T>;

export interface Point { x: number; y: number; }

export type Disposer = () => void;

export interface MemberDefinition {
  get?: (ctx: Context) => unknown;
  set?: (value: unknown, ctx: Context) => void;
  /** `'document'` hides it on facades of a subtree. */
  only?: 'document';
}

/** A bare function is a method, called with the facade as `this`. */
export type Member = MemberDefinition | ((this: Domina, ...args: any[]) => unknown);

export interface SpaceDefinition {
  get: (key: string, ctx: Context) => unknown;
  set?: (key: string, value: unknown, ctx: Context) => void;
  delete?: (key: string, ctx: Context) => void;
  has?: (key: string, ctx: Context) => boolean;
  keys?: (ctx: Context) => string[];
  only?: 'document';
}

export interface Context {
  document: Document;
  facade: Domina;
  /** The element namespaces write to: `<html>`, the element, or the shadow host. */
  host: Element;
  isDocument: boolean;
  root: Document | Element | ShadowRoot;
}

export interface Entry {
  kind: 'value' | 'method' | 'space';
  name: string;
  only: 'document' | null;
  writable: boolean;
}

export interface Domina {
  /** `d()` of `@domina/chain`. Within a subtree, the subtree is the context. */
  (spec?: Spec, context?: Spec): Chain;

  // :::::: mirrored, native arguments behave natively

  querySelector(selector: Selector): Element | null;
  querySelectorAll(selector: Selector): NodeListOf<Element>;
  /** Props and children fill the gap. A string or `{ is }` alone stay native. */
  createElement(tag: string, props?: string | ElementCreationOptions | Record<string, unknown>, ...children: unknown[]): HTMLElement;
  /** A selector as second argument delegates, several types are split. Returns a disposer. */
  addEventListener(types: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Disposer;
  addEventListener(types: string, selector: string, handler: Handler, options?: AddEventListenerOptions): Disposer;
  /** Without a listener: everything domina added for these types. */
  removeEventListener(types: string, listener?: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

  // :::::: short forms

  /** The first match or `null`. */
  get(selector: Selector, context?: Spec): Element | null;
  /** Every match, as a List: an array whose find, filter, some … take a matcher object or a selector too. */
  getList(selector: Selector, context?: Spec): List<Element>;
  /** `dd()` of `@domina/chain`. */
  all(spec?: Spec, context?: Spec): Chain<true>;
  create(tag?: string, props?: Record<string, unknown>, ...children: unknown[]): HTMLElement;
  /** A template literal with escaped values, or a string taken as html as it is. */
  html(strings: TemplateStringsArray | string, ...values: unknown[]): DocumentFragment;
  on(types: string, handler: Handler, options?: AddEventListenerOptions): Disposer;
  on(types: string, selector: string, handler: Handler, options?: AddEventListenerOptions): Disposer;
  once(types: string, handler: Handler, options?: AddEventListenerOptions): Disposer;
  once(types: string, selector: string, handler: Handler, options?: AddEventListenerOptions): Disposer;
  off(types?: string, handler?: Handler): void;
  /** A bubbling `CustomEvent` on the root. `false` when a listener called `preventDefault()`. */
  emit(type: string, detail?: unknown, options?: CustomEventInit): boolean;

  // :::::: state

  readonly document: Document;
  readonly root: Element;
  readonly body: HTMLElement;
  readonly head: HTMLHeadElement;

  title: string;
  lang: string | null;
  dir: string | null;
  /** `<meta name="color-scheme">` and `color-scheme` on `:root`. */
  scheme: string | null;
  scroll: Point & { smooth?: boolean };
  /** The innermost focused element. Setting focuses a selector or an element. */
  focus: Element | string | null;

  /** Custom properties on the host. Read: computed. Keys: the inline ones. */
  vars: Space<string | number | null>;
  /** `data-*` on the host. Strings in, strings out; `true` is empty, `false` removes. */
  data: Space<string | boolean | number | null>;
  /** Attributes of the host. */
  attr: Space<string | boolean | number | null>;
  /** Classes of the host: `class.name = boolean`. */
  class: Space<boolean>;
  meta: Space<string | null>;
  readonly id: Space<Element | null>;
  readonly forms: Space<HTMLFormElement | null>;
  /** Form values by form name. */
  values: Space<Record<string, unknown> | null>;

  // :::::: environment

  readonly ready: Promise<void>;
  readonly loaded: Promise<void>;
  readonly fontsReady: Promise<void>;
  readonly visible: boolean;
  readonly focused: boolean;
  readonly online: boolean;
  /** `false` when the user prefers reduced motion. */
  readonly motion: boolean;
  readonly url: URL;

  // :::::: whole

  /** Members and namespaces at once, in the shape of the state itself. */
  set(map: Record<string, unknown>): Domina;
  snapshot(): Record<string, unknown>;
  toJSON(): Record<string, unknown>;
  /** `'title'`, `'data.theme'`, `'vars.accent'`, `'visible'` … */
  watch(path: string, callback: (value: unknown, old: unknown) => void): Disposer;
  /** The same facade for a subtree or a shadow root. */
  within(root: string | Element | ShadowRoot | Document): Domina;

  // :::::: extending

  readonly api: Map<string, Entry>;
  /** Throws when the name exists on domina or on document. */
  extend(definitions: Record<string, Member>): void;
  space(name: string, definition: SpaceDefinition): void;

  /** Anything else of document, functions bound. */
  [key: string]: any;
}

/** A test: a function, a selector, or { key: value } (the property when the element has one, else the attribute). */
export type Matcher<T = Element> = ((item: T, index: number, list: T[]) => unknown) | string | Record<string, unknown>;

export declare class List<T = Element> extends Array<T> {
  every     (test: Matcher<T>): boolean;
  filter    (test: Matcher<T>): List<T>;
  find      (test: Matcher<T>): T | undefined;
  findIndex (test: Matcher<T>): number;
  findLast  (test: Matcher<T>): T | undefined;
  some      (test: Matcher<T>): boolean;
}

export declare function matcherOf<T = Element> (test: Matcher<T>): (item: T) => boolean;

export declare const domina: Domina;
export declare const api: Map<string, Entry>;
export declare function extend(definitions: Record<string, Member>): void;
export declare function space(name: string, definition: SpaceDefinition): void;
export declare function within(root: string | Element | ShadowRoot | Document): Domina;
/** The paths `watch()` knows, by their first segment. */
export declare const watchable: string[];

export default domina;
