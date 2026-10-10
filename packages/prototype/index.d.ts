// @domina/prototype - type declarations

/** a selector, or an object that describes the element. false and nullish leave a key out. */
export type ElementSpec = string | {
  tag?: string;
  tagName?: string;
  id?: string;
  class?: string | string[];
  className?: string | string[];
  dataset?: Record<string, string | number | boolean | null | undefined>;
  data?: Record<string, string | number | boolean | null | undefined>;
  [attribute: string]: unknown;
};

/** 'click keydown', 'click, keydown' or a list of types. */
export type EventTypes = string | string[];

export type Off = () => void;

/** an aria value: true and false are kept as strings, a list is joined with spaces, nullish removes. */
export type AriaValue = string | number | boolean | Array<string | number> | null | undefined;

/** a child for update and createElement: nested lists are flattened, nullish and false dropped. */
export type Child = Node | string | number | boolean | null | undefined | Child[];

/** the props of update and createElement. nullish props are skipped. */
export type UpdateProps = Record<string, unknown> & {
  /** an element, a domina wrapper or a spec in the document, the element is appended to it. */
  appendTo?: unknown;
  /** like appendTo, prepended. */
  prependTo?: unknown;
  /** gets the element last, a function or `{ current }`. */
  ref?: ((element: any) => void) | { current: unknown };
  /** a string is the style attribute. an object: numbers get px where it is no plain number, nullish and false remove. */
  style?: string | Record<string, string | number | false | null | undefined>;
  /** objects and lists as json, nullish removes. */
  dataset?: Record<string, unknown>;
  data?: Record<string, unknown>;
  /** 'a b, c', a list or `{ name: on }`. */
  class?: string | Record<string, unknown> | Array<unknown>;
  className?: string | Record<string, unknown> | Array<unknown>;
  /** a customized built-in, only for createElement. */
  is?: string;
};

/** the selector a spec stands for. */
export function selectorOf (spec: ElementSpec): string;

interface Queryable {
  /** the first match, null when there is none or the selector is invalid. */
  getElement<E extends Element = Element> (spec: ElementSpec): E | null;
  /** all matches as a real array, none when the selector is invalid. */
  getElements<E extends Element = Element> (spec: ElementSpec): E[];
}

declare global {
  interface EventTarget {
    /** a listener on one or more types, focus and blur as focusin and focusout. returns off(). */
    onEvent (types: EventTypes, handler: (event: any) => void, options?: boolean | AddEventListenerOptions): Off;
    /** `{ click: fn, 'keydown keyup': fn }` with shared options, one off() for all. */
    onEvents (map: Record<string, (event: any) => void>, options?: boolean | AddEventListenerOptions): Off;
    /** a CustomEvent, bubbling and cancelable by default. false when a listener prevented it. */
    emitEvent<D = unknown> (type: string, detail?: D, options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }): boolean;
    /** the next of the types as a promise, then all listeners are gone. a timeout rejects, so does an aborted signal. */
    waitForEvent<E extends Event = Event> (types: EventTypes, options?: { signal?: AbortSignal; timeout?: number }): Promise<E>;
  }

  interface Element extends Queryable {
    /** camelCase keys as kebab-case. false and nullish remove, true sets it empty. aria-* keys go to setAriaAttribute. */
    setAttributes (map: Record<string, unknown>): this;
    /** 'expanded', 'ariaExpanded' or 'aria-expanded'. true and false as 'true' / 'false', a list joined with spaces, nullish removes. */
    setAriaAttribute (name: string, value: AriaValue): this;
    /** setAriaAttribute key by key. */
    setAriaAttributes (map: Record<string, AriaValue>): this;
    /** property by property. style and dataset take an object, class a list. */
    setProperties (map: Record<string, unknown> & {
      style?: string | Record<string, string | number | false | null | undefined>;
      dataset?: Record<string, unknown>;
      class?: string | Array<string | null | undefined | false>;
    }): this;

    /** props, children, a place and a ref in one call, the same as updateElement of @domina/methods. returns the element. */
    update (props?: UpdateProps | null, ...children: Child[]): this;

    /** the element siblings, a spec filters them. */
    getSiblings<E extends Element = Element> (filter?: ElementSpec): E[];
    /** the ancestors, the nearest first. */
    getParents<E extends Element = Element> (filter?: ElementSpec): E[];
    /** the following element siblings, the nearest first. */
    getNextAll<E extends Element = Element> (filter?: ElementSpec): E[];
    /** the preceding element siblings, the nearest first. */
    getPrevAll<E extends Element = Element> (filter?: ElementSpec): E[];
    /** the position among the element siblings, -1 without a parent. */
    getIndex (): number;

    /** in the viewport: ratio 0 is a pixel, 1 the whole element. */
    isInViewport (options?: { ratio?: number }): boolean;
    /** the running animations done, cancelled ones count. resolves with the element. */
    waitForAnimations (options?: { name?: string; subtree?: boolean }): Promise<this>;
  }

  interface HTMLFormElement {
    /** the named controls as one object: checkboxes as booleans or lists, numbers as numbers, radios as the checked value. */
    getValues (options?: { disabled?: boolean; trim?: boolean }): Record<string, unknown>;
    /** values into the controls of their name. undefined leaves a control alone, { missing: 'clear' } clears the absent ones. */
    setValues (values: Record<string, unknown>, options?: { missing?: 'skip' | 'clear'; notify?: boolean }): this;
  }

  interface Document extends Queryable {
    /** the native element, then update. a string or `{ is }` as the second argument is the native call. */
    createElement<K extends keyof HTMLElementTagNameMap> (tagName: K, props?: UpdateProps | null, ...children: Child[]): HTMLElementTagNameMap[K];
    createElement (tagName?: string, props?: UpdateProps | null, ...children: Child[]): HTMLElement;
  }
  interface DocumentFragment extends Queryable {}

  interface CSSStyleDeclaration {
    /** a custom property, the name with or without its dashes. nullish and false remove. */
    setToken (name: string, value: unknown): this;
    setTokens (map: Record<string, unknown>): this;
    /** the trimmed value, null when unset. on getComputedStyle(el) the one in effect. */
    getToken (name: string): string | null;
    getTokens (names: string[] | Record<string, unknown>): Record<string, string | null>;
  }
}
