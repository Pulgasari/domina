// types.d.ts

/** Selektor-String, Element-Descriptor-Objekt oder echter Node. */
export type Spec = string | EDO | Element | Document | DocumentFragment;
export type Ctx = Spec | null | undefined;
export type Disposer = () => void;

export interface EDO {
  tag?: string;
  tagName?: string;
  id?: string;
  class?: string | string[];
  className?: string | string[];
  dataset?: Record<string, string | number>;
  data?: Record<string, string | number>;
  [attr: string]: unknown;
}

/** String ('a b'), Array (auch verschachtelt) oder Objekt ({ a: true, b: false }). */
export type Tokens = string | string[] | Tokens[] | Record<string, unknown> | null | undefined;

export type Child = Node | string | number | null | undefined | false | Child[];

export interface Props {
  style?: string | Partial<CSSStyleDeclaration> | Record<string, string | number>;
  dataset?: Record<string, string | number>;
  data?: Record<string, string | number>;
  class?: Tokens;
  className?: Tokens;
  appendTo?: Spec;
  prependTo?: Spec;
  [key: string]: unknown;
}

// ---- query
export function getElement(spec: Spec, ctx?: Ctx): Element | null;
export function getElements(spec: Spec, ctx?: Ctx): Element[];
export function getElementById(id: string, ctx?: Ctx): Element | null;
export function getElementsByClass(name: string, ctx?: Ctx): Element[];
export function getElementsByName(name: string, ctx?: Ctx): Element[];
export function getElementsByTag(name: string, ctx?: Ctx): Element[];
export function getElementsByDataAttr(key: string, ctx?: Ctx): Element[];
export function getElementsByDataKey(key: string, ctx?: Ctx): Element[];
export function clone<T extends Node>(spec: Spec, deep?: boolean): T | null;

// ---- element / create
export function createElement(tag?: string, props?: Props, ...children: Child[]): HTMLElement;
export function updateElement(spec: Spec, props?: Props, ...children: Child[]): Element | null;
export function createSVG(tag?: string, props?: Props, ...children: Child[]): SVGElement;
export function createFragment(...nodes: Child[]): DocumentFragment;
export function createHTML(html: unknown): DocumentFragment;
export function createTemplate(html: unknown, props?: Props): HTMLTemplateElement;
export function createTextNode(text: unknown): Text;
export function createStyleElement(source?: string | Props): HTMLStyleElement;

// ---- attr
export function getAttr(spec: Spec): Record<string, string>;
export function getAttr(spec: Spec, name: string): string | null;
export function hasAttr(spec: Spec, name: string): boolean;
export function setAttr(spec: Spec, map: Record<string, unknown>): Element | null;
export function setAttr(spec: Spec, name: string, value: unknown): Element | null;
export function removeAttr(spec: Spec, ...names: (string | string[])[]): Element | null;
export function toggleAttr(spec: Spec, name: string, force?: boolean): Element | null;

// ---- class
export function getClass(spec: Spec): string[];
export function getClass(spec: Spec, name: string): boolean;
export function hasClass(spec: Spec, names: Tokens): boolean;
export function setClass(spec: Spec, names: Tokens): Element | null;
export function addClass(spec: Spec, ...names: Tokens[]): Element | null;
export function removeClass(spec: Spec, ...names: Tokens[]): Element | null;
export function toggleClass(spec: Spec, names: Tokens, force?: boolean): Element | null;
export function replaceClass(spec: Spec, from: Tokens, to: Tokens): Element | null;

// ---- data
export function getData(spec: Spec, name?: undefined, opts?: { cast?: boolean }): Record<string, unknown>;
export function getData(spec: Spec, name: string, opts?: { cast?: boolean }): unknown;
export function hasData(spec: Spec, name: string): boolean;
export function setData(spec: Spec, map: Record<string, unknown>): Element | null;
export function setData(spec: Spec, name: string, value: unknown): Element | null;
export function removeData(spec: Spec, ...names: (string | string[])[]): Element | null;

// ---- content
export function getText(spec: Spec): string | null;
export function setText(spec: Spec, text: unknown): Element | null;
export function getHTML(spec: Spec): string | null;
export function setHTML(spec: Spec, html: unknown): Element | null;
export function setContent(spec: Spec, ...nodes: Child[]): Element | null;
export function emptyElement(spec: Spec): Element | null;

// ---- values
export type CastMode = 'bool' | 'date' | 'number' | 'string';
export function getValue(node: Spec, mode?: CastMode | null): unknown;
export function setValue(node: Spec, value: unknown, opts?: { notify?: boolean }): Element | null;
export function notifyChange(el: Element): void;

// ---- style
export function getStyle(spec: Spec): CSSStyleDeclaration | null;
export function getStyle(spec: Spec, property: string, inline?: boolean): string | null;
export function setStyle(spec: Spec, map: Record<string, string | number | null | false>): Element | null;
export function setStyle(spec: Spec, property: string, value: string | number | null | false): Element | null;
export function removeStyle(spec: Spec, ...properties: (string | string[])[]): Element | null;
export function getCssVar(spec: Spec, name: string, inline?: boolean): string | null;
export function setCssVar(spec: Spec, map: Record<string, string | number | null | false>): Element | null;
export function setCssVar(spec: Spec, name: string, value: string | number | null | false): Element | null;

// ---- traverse
export function getParent(spec: Spec, filter?: Spec): Element | null;
export function getParents(spec: Spec, filter?: Spec): Element[];
export function getClosest(spec: Spec, selector: Spec): Element | null;
export function getChildren(spec: Spec, filter?: Spec): Element[];
export function getSiblings(spec: Spec, filter?: Spec): Element[];
export function getNext(spec: Spec, filter?: Spec): Element | null;
export function getPrev(spec: Spec, filter?: Spec): Element | null;
export function getNextAll(spec: Spec, filter?: Spec): Element[];
export function getPrevAll(spec: Spec, filter?: Spec): Element[];
export function getFirst(spec: Spec, ctx?: Ctx): Element | null;
export function getLast(spec: Spec, ctx?: Ctx): Element | null;
export function getIndex(spec: Spec): number;
export function containsElement(spec: Spec, other: Spec): boolean;
export function matchesElement(spec: Spec, selector: Spec): boolean;

// ---- insert
export type InsertPosition = 'append' | 'prepend' | 'before' | 'after';
export function appendTo(spec: Spec, target: Spec): Element | null;
export function prependTo(spec: Spec, target: Spec): Element | null;
export function insertBefore(spec: Spec, target: Spec): Element | null;
export function insertAfter(spec: Spec, target: Spec): Element | null;
export function moveTo(spec: Spec, target: Spec, position?: InsertPosition): Element | null;
export function insertAt(target: Spec, index: number, ...nodes: Child[]): Element | null;
export function wrap(spec: Spec, wrapper?: string | Spec, props?: Props): Element | null;
export function unwrap(spec: Spec): Node[] | null;
export function replaceElement(spec: Spec, ...nodes: Child[]): Node[] | null;
export function removeElement(...specs: (Spec | Spec[])[]): Element[];

// ---- geometry
export interface Size { width: number; height: number }
export interface Point { top: number; left: number }

export function getRect(spec: Spec): DOMRect | null;
export function getSize(spec: Spec, opts?: { box?: 'border' | 'content' | 'scroll' }): Size | null;
export function getOffset(spec: Spec): Point | null;
export function getPosition(spec: Spec): Point | null;
export function getOffsetParent(spec: Spec): Element | null;
export function getScroll(spec?: Spec | Window | null): Point;
export function setScroll(
  spec?: Spec | Window | null,
  opts?: { top?: number; left?: number; behavior?: ScrollBehavior }
): Element | Window;
export function scrollIntoView(spec: Spec, options?: ScrollIntoViewOptions | boolean): Element | null;
export function isInViewport(spec: Spec, opts?: { ratio?: number }): boolean;

// ---- head
export interface LinkSpec { rel?: string; href?: string; [attr: string]: unknown }

export function getHead(): HTMLHeadElement;
export function getTitle(): string;
export function setTitle(title: unknown): HTMLTitleElement;
export function setLink(spec?: LinkSpec): Element | null;
export function setHead(spec?: {
  title?: unknown;
  meta?: Record<string, unknown> | Record<string, unknown>[];
  link?: LinkSpec | LinkSpec[];
  [prop: string]: unknown;
}): HTMLHeadElement | null;
export function upsertHead<T extends Element>(selector: string, make: () => T): T;

/** @deprecated setTitle */ export const updateTitle: typeof setTitle;
/** @deprecated setHead  */ export const updateHead: typeof setHead;

// ---- meta
export function getMeta(): Record<string, string>;
export function getMeta(key: string): string | null;
export function getMetaAttr(key: string): 'name' | 'property' | 'http-equiv';
export function getMetaElement(key: string): HTMLMetaElement | null;
export function hasMeta(key: string): boolean;
export function setMeta(map: Record<string, unknown>): Record<string, Element | null>;
export function setMeta(key: string, value: unknown): Element | null;
export function removeMeta(...keys: (string | string[])[]): Element[];

/** @deprecated setMeta */ export const updateMeta: typeof setMeta;

// ---- fonts
export function addFont(family: string, source: string | FontFace, descriptors?: FontFaceDescriptors): FontFace | null;
export function hasFont(spec: string): boolean;
export function loadFont(spec: string, text?: string): Promise<FontFace[]>;
export function getFonts(family?: string): FontFace[];
export function removeFont(...families: (string | string[])[]): FontFace[];
export function fontsReady(): Promise<FontFaceSet | null>;
export function getFontStatus(): FontFaceSetLoadStatus;
export function eachFont(callback: (face: FontFace) => void): void;

// ---- stylesheet
export interface SheetOptions {
  target?: Spec | Document | ShadowRoot;
  scope?: string | null;
  layer?: string | null;
  key?: string;
  replace?: boolean;
  media?: string;
}

export function setStyleElement(css: string | null, opts?: { id?: string; media?: string }): HTMLStyleElement | null;
export function createStylesheet(
  css: string,
  opts?: { scope?: string | null; layer?: string | null; media?: string; disabled?: boolean }
): CSSStyleSheet;
export function adoptStylesheet(source: string | Response | CSSStyleSheet, opts?: SheetOptions): Promise<CSSStyleSheet | null>;
export function releaseStylesheet(sheetOrKey: CSSStyleSheet | string, opts?: { target?: SheetOptions['target'] }): Promise<boolean>;
export function hasStylesheet(sheet: CSSStyleSheet, opts?: { target?: SheetOptions['target'] }): boolean;
export function getStylesheets(opts?: { target?: SheetOptions['target'] }): CSSStyleSheet[];
export function scopeStylesheet<T>(sheetOrRules: T, scope: string): T;

/** @deprecated setStyleElement */ export const updateStyleElement: typeof setStyleElement;

// ---- events
export type EventTypes = string | string[];

export function onEvent(targets: unknown, types: EventTypes, handler: (e: Event) => void, options?: AddEventListenerOptions | boolean): Disposer;
export function onceEvent(targets: unknown, types: EventTypes, handler: (e: Event) => void, options?: AddEventListenerOptions | boolean): Disposer;
export function offEvent(targets: unknown, types: EventTypes, handler: (e: Event) => void, options?: AddEventListenerOptions | boolean): void;
export function emitEvent(
  target: unknown, type: string, detail?: unknown,
  options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }
): boolean;
export function onCustom(targets: unknown, types: EventTypes, handler: (detail: unknown, e: CustomEvent) => void, options?: AddEventListenerOptions | boolean): Disposer;
export function waitForEvent(target: unknown, type: string, opts?: { signal?: AbortSignal; timeout?: number }): Promise<Event>;
export const waitFor: typeof waitForEvent;

export function delegate(
  container: Spec, types: EventTypes, selector: string,
  handler: (this: Element, e: Event, match: Element) => void,
  options?: AddEventListenerOptions | boolean
): Disposer;

export function onOutside(
  spec: Spec, handler: (e: Event, el: Element) => void,
  opts?: { events?: string[]; escape?: boolean; root?: Document | Element }
): Disposer;

// ---- observer
export interface ObserveHandlers {
  within?: Spec;
  onInit?(el: Element, detail: { initial: boolean }): void | Disposer;
  onAdded?(el: Element, detail: { initial: boolean }): void | Disposer;
  onMatch?(el: Element, detail: { initial: boolean }): void | Disposer;
  onRemoved?(el: Element, detail: { initial: boolean }): void;
  onAttr?: AttrHandler | Record<string, AttrHandler | { handler: AttrHandler }>;
  onIntersect?: IOHandler | (IntersectionObserverInit & { handler: IOHandler });
  onVisible?: IOHandler | (IntersectionObserverInit & { handler: IOHandler });
  onHidden?: IOHandler | (IntersectionObserverInit & { handler: IOHandler });
  onResize?: ROHandler | { handler: ROHandler };
}

type AttrHandler = (el: Element, d: { name: string; value: string | null; old: string | null }) => void;
type IOHandler = (el: Element, entry: IntersectionObserverEntry) => void;
type ROHandler = (el: Element, entry: ResizeObserverEntry) => void;

export function observe(target: Spec, handlers?: ObserveHandlers): Disposer;
export function observe(map: Record<string, ObserveHandlers>): Disposer;

export function onConnected(node: Spec, cb: (el: Element) => void): Disposer;
export function onDisconnected(node: Spec, cb: (el: Element) => void): Disposer;
export function onAdded(target: Spec, cb: (el: Element) => void): Disposer;
export function onRemoved(target: Spec, cb: (el: Element) => void): Disposer;
export function onAttr(target: Spec, spec: ObserveHandlers['onAttr']): Disposer;
export function onResize(target: Spec, cb: ROHandler): Disposer;
export function onVisible(target: Spec, cb: IOHandler, options?: IntersectionObserverInit): Disposer;

// ---- raf
export function measure<T>(fn: () => T): Promise<T>;
export function mutate<T>(fn: () => T): Promise<T>;
export function frame<R, W>(readFn: () => R, writeFn: (value: R) => W): Promise<W>;
export function nextFrame(): Promise<void>;
export function flushSync(): void;

// ---- form
export function getFormValues(
  form: Spec,
  opts?: { trim?: boolean; includeDisabled?: boolean }
): Record<string, unknown>;

export function setFormValues(
  form: Spec,
  values?: Record<string, unknown>,
  opts?: { notify?: boolean; missing?: 'skip' | 'clear' }
): HTMLFormElement | null;

// ---- collection
export type SortDirection = 'asc' | 'desc';
export type SortMode = 'regular' | 'num' | 'date' | 'auto';
export type SortOrder =
  | 'random'
  | SortDirection
  | `${SortMode}-${SortDirection}`
  | ((a: unknown, b: unknown, elA: Element, elB: Element) => number);

export type SortSpec =
  | string
  | SortOrder
  | [selector: string, order?: SortOrder]
  | { selector?: string | null; order?: SortOrder };

export function sortElements(opts: {
  container: Spec;
  item: Spec;
  indicators?: SortSpec | SortSpec[];
}): Element[];

export type FilterMode =
  | 'contains' | 'includes' | 'startsWith' | 'endsWith' | 'exact'
  | 'num-eq' | 'num-gt' | 'num-lt' | 'num-ge' | 'num-le'
  | 'date-eq' | 'date-after' | 'date-before';

export type FilterSpec =
  | ((itemValue: unknown, value: unknown, el: Element) => boolean)
  | [selector: string, value: unknown, mode?: FilterMode]
  | { selector?: string; value?: unknown; mode?: FilterMode; customFn?: Function };

export function filterElements(opts: {
  container: Spec;
  item: Spec;
  filters?: FilterSpec | FilterSpec[];
  mismatchClass?: string;
}): { total: number; matched: number; items: Element[] };

export interface Group {
  key: string;
  items: Element[];
  header: Element | null;
}

export function groupElements(opts: {
  container: Spec;
  item: Spec;
  by: string | ((el: Element) => unknown);
  header?: string | ((key: string, items: Element[]) => Node | string) | null;
  sort?: 'asc' | 'desc' | false | ((a: string, b: string) => number);
  groupClass?: string | null;
  emptyKey?: string;
}): Group[];

// ============================================================ sugar

/** Nie null. .ok fragt nach, .node liefert das rohe Element. */
export interface ElementHandle {
  readonly node: Element | null;
  readonly ok: boolean;

  find(spec: Spec): ElementHandle;
  findAll(spec: Spec): ElementList;

  update(props?: Props, ...children: Child[]): ElementHandle;
  setAttr(map: Record<string, unknown>): ElementHandle;
  setAttr(name: string, value: unknown): ElementHandle;
  removeAttr(...names: (string | string[])[]): ElementHandle;
  toggleAttr(name: string, force?: boolean): ElementHandle;
  setClass(names: Tokens): ElementHandle;
  addClass(...names: Tokens[]): ElementHandle;
  removeClass(...names: Tokens[]): ElementHandle;
  toggleClass(names: Tokens, force?: boolean): ElementHandle;
  setData(map: Record<string, unknown>): ElementHandle;
  setData(name: string, value: unknown): ElementHandle;
  removeData(...names: (string | string[])[]): ElementHandle;
  setText(text: unknown): ElementHandle;
  setHTML(html: unknown): ElementHandle;
  setContent(...nodes: Child[]): ElementHandle;
  empty(): ElementHandle;
  setValue(value: unknown, opts?: { notify?: boolean }): ElementHandle;
  setStyle(map: Record<string, string | number | null | false>): ElementHandle;
  setStyle(property: string, value: string | number | null | false): ElementHandle;
  setCssVar(map: Record<string, string | number | null | false>): ElementHandle;
  setCssVar(name: string, value: string | number | null | false): ElementHandle;
  appendTo(target: Spec): ElementHandle;
  prependTo(target: Spec): ElementHandle;
  insertBefore(target: Spec): ElementHandle;
  insertAfter(target: Spec): ElementHandle;
  moveTo(target: Spec, position?: InsertPosition): ElementHandle;
  wrapWith(wrapper?: string | Spec, props?: Props): ElementHandle;
  parent(filter?: Spec): ElementHandle;
  closest(selector: Spec): ElementHandle;
  next(filter?: Spec): ElementHandle;
  prev(filter?: Spec): ElementHandle;
  clone(deep?: boolean): ElementHandle;
  scrollTo(options?: ScrollIntoViewOptions | boolean): ElementHandle;

  getAttr(name?: string): string | Record<string, string> | null;
  hasAttr(name: string): boolean;
  getClass(name?: string): string[] | boolean;
  hasClass(names: Tokens): boolean;
  getData(name?: string, opts?: { cast?: boolean }): unknown;
  hasData(name: string): boolean;
  getText(): string | null;
  getHTML(): string | null;
  getValue(mode?: CastMode | null): unknown;
  getStyle(property?: string, inline?: boolean): CSSStyleDeclaration | string | null;
  getCssVar(name: string, inline?: boolean): string | null;
  getRect(): DOMRect | null;
  getSize(opts?: { box?: 'border' | 'content' | 'scroll' }): Size | null;
  getOffset(): Point | null;
  getPosition(): Point | null;
  getIndex(): number;
  isInViewport(opts?: { ratio?: number }): boolean;
  matches(selector: Spec): boolean;
  children(filter?: Spec): Element[];
  parents(filter?: Spec): Element[];
  siblings(filter?: Spec): Element[];
  unwrap(): Node[] | null;
  replaceWith(...nodes: Child[]): Node[] | null;
  remove(): Element[];
  emitEvent(type: string, detail?: unknown, options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }): boolean;
  offEvent(types: EventTypes, handler: (e: Event) => void, options?: AddEventListenerOptions | boolean): void;

  onEvent(types: EventTypes, handler: (e: Event) => void, options?: AddEventListenerOptions | boolean): Disposer;
  onceEvent(types: EventTypes, handler: (e: Event) => void, options?: AddEventListenerOptions | boolean): Disposer;
  onOutside(handler: (e: Event, el: Element) => void, opts?: { events?: string[]; escape?: boolean; root?: Document | Element }): Disposer;
  delegate(types: EventTypes, selector: string, handler: (this: Element, e: Event, match: Element) => void, options?: AddEventListenerOptions | boolean): Disposer;
}

/** Array von Handles. Jede API-Methode fächert über alle Elemente auf. */
export type ElementList = ElementHandle[] & {
  [K in keyof ElementHandle]: ElementHandle[K] extends (...args: infer A) => infer R
    ? R extends ElementHandle ? (...args: A) => ElementList
    : R extends Disposer      ? (...args: A) => Disposer
    : (...args: A) => R[]
    : never;
};

export function element(spec?: Spec | null, ctx?: Ctx): ElementHandle;
export function elements(spec?: Spec | Element[] | null, ctx?: Ctx): ElementList;
export function isWrapped(value: unknown): value is ElementHandle;

export interface FormHandle {
  readonly raw: HTMLFormElement | null;
  values: Record<string, unknown>;
  getValues(opts?: { trim?: boolean; includeDisabled?: boolean }): Record<string, unknown>;
  setValues(values: Record<string, unknown>, opts?: { notify?: boolean; missing?: 'skip' | 'clear' }): FormHandle;
  on(listeners: Record<string, (e: Event) => void>, options?: AddEventListenerOptions | boolean): Disposer;
  checkValidity(): boolean;
  reportValidity(): boolean;
  reset(): FormHandle;
  submit(): FormHandle;
  /** Feldzugriff per name – auch Controls, die per form="id" ausserhalb stehen. */
  [field: string]: unknown;
}

export function form(spec: Spec): FormHandle;

/** meta.description = '…', meta.og.image = '…', String(meta.og.image), delete meta.og.image */
export interface MetaNamespace {
  get: typeof getMeta;
  set: typeof setMeta;
  has: typeof hasMeta;
  remove: typeof removeMeta;
  [key: string]: any;
}

export const meta: MetaNamespace;

export interface FontHandle {
  readonly family: string;
  readonly faces: FontFace[];
  readonly loaded: boolean;
  add(source: string | FontFace, descriptors?: FontFaceDescriptors): FontHandle;
  load(size?: string, text?: string): Promise<FontFace[]>;
  has(size?: string): boolean;
  remove(): FontHandle;
}

export function font(family: string): FontHandle;

export const fonts: {
  add: typeof addFont;
  has: typeof hasFont;
  load: typeof loadFont;
  remove: typeof removeFont;
  each: typeof eachFont;
  readonly list: FontFace[];
  readonly status: FontFaceSetLoadStatus;
  readonly ready: Promise<FontFaceSet | null>;
  readonly families: string[];
};

export interface StylesheetHandle {
  readonly source: string | Response | CSSStyleSheet;
  readonly options: SheetOptions;
  readonly sheet: CSSStyleSheet | null;
  readonly adopted: boolean;
  adopt(): Promise<CSSStyleSheet | null>;
  replace(css?: string): Promise<CSSStyleSheet | null>;
  release(): Promise<boolean>;
  scope(selector: string): StylesheetHandle;
}

export function stylesheet(source: string | Response | CSSStyleSheet, options?: SheetOptions): StylesheetHandle;

export function stylesheets(target?: Spec | Document | ShadowRoot): {
  readonly target: Spec | Document | ShadowRoot;
  readonly list: CSSStyleSheet[];
  readonly length: number;
  add(source: string | Response | CSSStyleSheet, extra?: SheetOptions): Promise<CSSStyleSheet | null>;
  remove(sheetOrKey: CSSStyleSheet | string): Promise<boolean>;
  has(sheet: CSSStyleSheet): boolean;
  clear(): Promise<void>;
  inline: typeof setStyleElement;
};
