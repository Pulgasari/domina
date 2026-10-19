type Handler = (this: AufbauElement, event: Event, node: Element) => void;

/**
 * a schema entry: a type, a default value, or the full form. `prop: true` (or the type
 * Array, Object, Function) stores the value on the instance instead of an attribute,
 * `state: true` does the same without a public accessor.
 */
type AttrEntry = Function | {
  type?       : Function,
  default?    : unknown,
  values?     : unknown[],
  fn?         : Function,
  var?        : boolean | string,
  prop?       : boolean,
  state?      : boolean,
  hasChanged? : (value: unknown, old: unknown) => boolean,
} | unknown;

export declare class Selection implements Iterable<Element> {
  readonly node  : Element | null;
  readonly nodes : Element[];
  readonly size  : number;

  [Symbol.iterator] (): Iterator<Element>;

  $     (target: string | EventTarget | Iterable<EventTarget> | null | undefined): Selection;
  $$    (selector: string): Selection;
  part  (name: string): Selection;
  parts (name: string): Selection;

  filter   (test: (node: Element) => boolean): Selection;
  find     (test: (node: Element) => boolean): Element | null;
  includes (node: unknown): boolean;
  matches  (selector: string): boolean;
  until    (signal: AbortSignal): Selection;

  on (types: string | string[], handler: Handler, options?: AddEventListenerOptions): this;
  on (types: string | string[], selector: string, handler: Handler, options?: AddEventListenerOptions): this;

  onBlur        (handler: Handler, options?: AddEventListenerOptions): this;
  onChange      (handler: Handler, options?: AddEventListenerOptions): this;
  onClick       (handler: Handler, options?: AddEventListenerOptions): this;
  onFocus       (handler: Handler, options?: AddEventListenerOptions): this;
  onInput       (handler: Handler, options?: AddEventListenerOptions): this;
  onKeyDown     (handler: Handler, options?: AddEventListenerOptions): this;
  onPointerDown (handler: Handler, options?: AddEventListenerOptions): this;
  onSubmit      (handler: Handler, options?: AddEventListenerOptions): this;

  emit (type: string, detail?: unknown, options?: { bubbles?: boolean, cancelable?: boolean, composed?: boolean }): boolean;

  attr  (name: string): string | null;
  attr  (map: Record<string, unknown>): this;
  text  (): string;
  text  (value: string): this;
  focus (options?: FocusOptions): this;
}

/** Anything with a standard schema interface: @rat/types, zod, valibot … */
export interface StandardSchema<T = unknown> {
  readonly '~standard': { validate (value: unknown): { value: T, issues?: undefined } | { issues: readonly { message: string }[] } | Promise<unknown> };
  /** Where the prop starts, @rat/types has it. */
  readonly initial?: T;
  /** @rat/types: 'bool', 'enum', 'num', 'str' live in the attribute, anything else is a stored prop. */
  readonly kind?: string;
}

/** A schema or a constructor, or { type, onChange, reflect }. */
export type PropEntry = StandardSchema | StringConstructor | NumberConstructor | BooleanConstructor
  | { type: StandardSchema | StringConstructor | NumberConstructor | BooleanConstructor, onChange?: (this: AufbauElement, value: any, old: any) => void, reflect?: boolean };

/** Observers bound to the element, stopped when it is disconnected. Each returns its stop. */
export interface ElementObserver {
  /** Present now or added later, below the element. */
  added   (selector: string, fn: (element: Element) => void): () => void;
  attr    (name: string, fn: (change: { name: string, value: string | null, old: string | null }) => void): () => void;
  removed (selector: string, fn: (element: Element) => void): () => void;
  resized (fn: (entry: ResizeObserverEntry) => void): () => void;
  visible (fn: (visible: boolean, entry: IntersectionObserverEntry) => void): () => void;
}

export interface Media {
  readonly coarse : boolean;
  readonly dark   : boolean;
  readonly hover  : boolean;
  readonly light  : boolean;
  readonly print  : boolean;
  matches (query: string): boolean;
  /** On a change of the query, returns its stop. On an element it stops on disconnect too. */
  on (query: string, fn: (matches: boolean, event: MediaQueryListEvent) => void): () => void;
}

/** The preferences of the user that elements have to respect. */
export interface A11y {
  readonly contrast            : boolean;
  readonly forcedColors        : boolean;
  readonly reducedMotion       : boolean;
  readonly reducedTransparency : boolean;
}

export declare const a11y  : A11y;
export declare const media : Media;

export declare class AufbauElement extends HTMLElement {
  static attr?      : Record<string, AttrEntry>;
  /** Props from schemas: checked on every set (a failing value is warned about, the old one stays), simple ones reflected. */
  static props?     : Record<string, PropEntry>;
  /** Every entry of the schema, also one whose name the element has already (title, hidden …). */
  readonly props    : Record<string, any>;
  /** @domina/proxy below the element: dom.get(), dom.getList() whose find/filter take a matcher object or a selector. */
  readonly dom      : import('@domina/proxy').Domina;
  readonly observe  : ElementObserver;
  readonly a11y     : A11y;
  readonly media    : Media;
  /** What el.name = value does: checked against the schema, then the attribute or the stored prop. */
  setValue (name: string, value: unknown): this;
  /** `false` updates at once on every change instead of once per microtask. */
  static batch?     : boolean;
  /** The events it fires, name -> description, for the manifest. */
  static events?    : Record<string, string>;
  /** Its slots, name ('' for the default one) -> description, for the manifest. */
  static slots?     : Record<string, string>;
  static internals? : boolean | Partial<ElementInternals>;
  static parts?     : string[];
  static reflect?   : string[];
  static shadow?    : boolean | ShadowRootInit;
  static skeleton?  : object | (() => object);
  static styles?    : Styles | (() => Styles);

  static init (name?: string): void;

  readonly focused   : Element | null;
  readonly internals : ElementInternals | null;
  readonly root      : ShadowRoot | this;
  readonly self      : Selection;
  readonly signal    : AbortSignal;
  readonly states    : { add (name: string): unknown, delete (name: string): unknown, has (name: string): boolean, toggle (name: string, force?: boolean): unknown };

  $     (target: string | EventTarget | Iterable<EventTarget> | null | undefined): Selection;
  $$    (selector: string): Selection;
  part  (name: string): Selection;
  parts (name: string): Selection;

  on   (types: string | string[], handler: Handler, options?: AddEventListenerOptions): this;
  on   (types: string | string[], selector: string, handler: Handler, options?: AddEventListenerOptions): this;
  emit (type: string, detail?: unknown, options?: { bubbles?: boolean, cancelable?: boolean, composed?: boolean }): boolean;

  onBlur        (handler: Handler, options?: AddEventListenerOptions): this;
  onChange      (handler: Handler, options?: AddEventListenerOptions): this;
  onClick       (handler: Handler, options?: AddEventListenerOptions): this;
  onFocus       (handler: Handler, options?: AddEventListenerOptions): this;
  onInput       (handler: Handler, options?: AddEventListenerOptions): this;
  onKeyDown     (handler: Handler, options?: AddEventListenerOptions): this;
  onPointerDown (handler: Handler, options?: AddEventListenerOptions): this;
  onSubmit      (handler: Handler, options?: AddEventListenerOptions): this;

  release (): this;
  track<T extends () => unknown> (stop: T): T;

  getAttr (): Record<string, any>;
  getAttr (name: string): any;
  hasAttr (name: string): boolean;
  setAttr (map: Record<string, unknown>): this;

  /** Stores the value of a prop entry; an update follows when it changed. */
  setProp  (name: string, value: unknown): this;
  /** Stores the value of a state entry; an update follows when it changed. */
  setState (name: string, value: unknown): this;

  setSkeleton (on?: boolean): this;
  setVar      (name: string, value: unknown): this;
  setVar      (map: Record<string, unknown>): this;

  /** Resolves once the pending update ran. */
  readonly updateComplete : Promise<boolean>;

  /** Marks a name as changed (every name without one) and schedules an update for the next microtask. */
  requestUpdate (name?: string): this;
  /** Runs the pending update at once, for code that reads the dom right after a change. */
  flush         (): this;
  /** Updates at once; without names every name counts as changed. */
  update        (changed?: Iterable<string>): this;

  invalidate (): this;
  render     (): unknown;
  sync       (changed: Set<string>): void;
  willUpdate (changed: Set<string>): void;

  onAdopted          (oldDocument: Document, newDocument: Document): void;
  onAttributeChanged (name: string, oldValue: string | null, newValue: string | null): void;
  onConnected        (): void;
  onConnectedMove    (): void;
  onDisconnected     (): void;
  onError            (error: unknown): void;
  onFirstRender      (): void;
  onRender           (changed: Set<string>): void;
}

type Constructor<T = AufbauElement> = abstract new (...args: any[]) => T;

export interface AufbauControl {
  value        : any;
  readonly defaultValue : string;
  readonly formValue    : string | null;
  readonly focusTarget  : Element | null;
  readonly form         : HTMLFormElement | null;
  disabled              : boolean;

  commit      (next: unknown, options?: { notify?: boolean }): this;
  formatValue (value: unknown): string;
  parseValue  (raw: string | null): unknown;
  validate    (): this;

  onFormAssociated   (form: HTMLFormElement | null): void;
  onFormDisabled     (disabled: boolean): void;
  onFormReset        (): void;
  onFormStateRestore (state: unknown, mode: string): void;
}

export interface AufbauSource {
  readonly output      : Element;
  readonly sourceNodes : Node[];
  readonly sourceText  : string;

  onSourceChange (): void;
}

export declare function withControl<T extends Constructor> (Base: T): T & Constructor<AufbauControl>;
export declare function withSource<T extends Constructor> (Base: T): T & Constructor<AufbauSource> & { output: string };

export declare const AufbauControlElement : typeof AufbauElement & Constructor<AufbauControl>;
export declare const AufbauSourceElement  : typeof AufbauElement & Constructor<AufbauSource>;

export declare const CONFIG_EVENT : string;

export declare function getConfig      (key: string, fallback?: string): string | undefined;
export declare function onConfigChange (listener: (event: CustomEvent<{ changed: string[] }>) => void): () => void;
export declare function setConfig      (key: string, value: unknown): void;
export declare function setConfig      (entries: Record<string, unknown>): void;

type StyleObject = { [selectorOrProperty: string]: StyleObject | string | number | (string | number)[] | null | undefined | false };
type Styles      = string | StyleObject | { toString (): string } | null | undefined | false | Styles[];

export declare function adoptBaseStyles (key: string, css: Styles): unknown;
export declare function cssOf           (styles: Styles | (() => Styles), owner?: unknown): string;
export declare function applySkin       (skin?: string): void;
export declare function setSkin         (skin: string | null): void;

export declare const session : unknown;
export declare const store   : unknown;

/** htx rendered by @domina/render: the result of render() is patched, only changed holes are written. */
export declare function html (strings: TemplateStringsArray, ...values: unknown[]): { program: unknown; values: unknown[] };
/** A keyed list for a child hole. Without key the position is the key. */
export declare function each<T> (items: Iterable<T>, key: (item: T, index: number) => unknown, row: (item: T, index: number) => unknown): unknown;
export declare function each<T> (items: Iterable<T>, row: (item: T, index: number) => unknown): unknown;
/** Markup as it is for a child hole, parsed only when it changed. */
export declare function raw (html: string | null | undefined): unknown;
/** One of two branches for a child hole. */
export declare function when (condition: unknown, then: () => unknown, otherwise?: (() => unknown) | null): unknown;

/** The same class: AufbauElement under its domina name. */
export declare const DominaElement: typeof AufbauElement;
