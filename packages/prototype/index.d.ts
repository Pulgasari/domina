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
  }

  interface Element extends Queryable {
    /** camelCase keys as kebab-case. false and nullish remove, true sets it empty, aria-* keeps 'true' / 'false'. */
    setAttributes (map: Record<string, unknown>): this;
    /** property by property. style and dataset take an object, class a list. */
    setProperties (map: Record<string, unknown> & {
      style?: string | Record<string, string | number | false | null | undefined>;
      dataset?: Record<string, unknown>;
      class?: string | Array<string | null | undefined | false>;
    }): this;
  }

  interface Document extends Queryable {}
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
