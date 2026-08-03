// types.d.ts

/** Selektor-String, Element-Descriptor-Objekt oder echter Node. */
export type Spec = string | EDO | Element | Document | DocumentFragment;
export type Ctx = Spec | null | undefined;

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

// ---- query
export function getElement(spec: Spec, ctx?: Ctx): Element | null;
export function getElements(spec: Spec, ctx?: Ctx): Element[];
export function getElementById(id: string, ctx?: Ctx): Element | null;
export function getElementsByDataAttr(key: string, ctx?: Ctx): Element[];
export function getElementsByDataKey(key: string, ctx?: Ctx): Element[];
export function clone<T extends Node>(spec: Spec, deep?: boolean): T | null;

export const element: typeof getElement;
export const elements: typeof getElements;

// ---- create / update
export type Child = Node | string | number | null | undefined | false | Child[];

export interface Props {
  style?: string | Partial<CSSStyleDeclaration> | Record<string, string>;
  dataset?: Record<string, string | number>;
  data?: Record<string, string | number>;
  class?: string | string[];
  className?: string | string[];
  appendTo?: Spec;
  prependTo?: Spec;
  [key: string]: unknown;
}

export function createElement(tag?: string, props?: Props, ...children: Child[]): HTMLElement;
export function createSVG(tag?: string, props?: Props, ...children: Child[]): SVGElement;
export function createFragment(...nodes: Child[]): DocumentFragment;
export function createHTML(html: string): DocumentFragment;
export function createStylesheet(sth: string | Props): HTMLStyleElement;
export function createTextNode(text: unknown): Text;
export function updateElement(spec: Spec, props?: Props, ...children: Child[]): Element | null;

// ---- values
export type CastMode = 'bool' | 'date' | 'number' | 'string';
export function getValue(node: Spec, mode?: CastMode | null): unknown;
export function setValue(node: Spec, value: unknown, opts?: { notify?: boolean }): Element | null;
export function notifyChange(el: Element): void;

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

// ---- events
export type Disposer = () => void;

export function delegate(
  container: Spec, type: string, selector: string,
  fn: (this: Element, e: Event, match: Element) => void,
  opts?: AddEventListenerOptions
): Disposer;

export function onOutside(
  spec: Spec, fn: (e: Event, el: Element) => void,
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

// ---- misc
export function wrap(spec: Spec, wrapper?: string | Spec, props?: Props): Element | null;
export function unwrap(spec: Spec): Node[] | null;
export function insertAt(target: Spec, index: number, ...nodes: Child[]): Element | null;
export function moveTo(spec: Spec, target: Spec, position?: 'append' | 'prepend' | 'before' | 'after'): Element | null;

// ---- raf
export function measure<T>(fn: () => T): Promise<T>;
export function mutate<T>(fn: () => T): Promise<T>;
export function frame<R, W>(readFn: () => R, writeFn: (value: R) => W): Promise<W>;
export function nextFrame(): Promise<void>;
export function flushSync(): void;
