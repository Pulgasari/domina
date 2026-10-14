/**
 * Renders a template into a target again and again and writes only what changed.
 * Templates arrive as programs (a tree with numbered holes); a syntax turns its
 * template literals into programs through {@link tag}.
 *
 * @example
 * ```js
 * import { program }     from '@htx/htx';
 * import { render, tag } from '@domina/render';
 *
 * const html = tag(program);
 * render(container, html`<p>${text}</p>`);
 * ```
 *
 * @module
 */

/** A value in a program: static, a hole, or text and holes joined. */
export type ProgramValue = unknown | { hole: number } | { parts: (string | { hole: number })[] };

/** A node of a program: text, a child hole, or an element. */
export type ProgramNode =
  | string
  | { hole: number }
  | { tag: string | ((props: Record<string, unknown>, children: TemplateResult | null) => unknown) | { hole: number }; props: ([string, ProgramValue] | { spread: number })[]; children: ProgramNode[] };

/** A template with numbered holes. */
export interface Program {
  nodes: ProgramNode[];
}

/** What a template tag returns: the program and the values of this call. */
export interface TemplateResult {
  program : Program;
  values  : unknown[];
}

/** An effect function of a signal library: runs fn, again on every change, returns its disposer. */
export type Effect = (fn: () => void) => (() => void) | { dispose (): void };

/** The options of {@link render}. */
export interface RenderOptions {
  /** Makes functions in value holes live, for this call. Wins over {@link configure}. */
  effect? : Effect | null;
}

/** A template tag over a parser, which is asked once per template literal. */
export declare function tag (parse: (strings: TemplateStringsArray) => Program): (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult;

/** Renders a value into a target: a template result, text, a node, a list. The first call replaces the target's children. */
export declare function render (target: Element | DocumentFragment, value: unknown, options?: RenderOptions): unknown;

/** Takes back what render() put into a target and disposes its effects. */
export declare function unrender (target: Element | DocumentFragment): void;

/** Sets the effect function for every render, making functions in value holes live. */
export declare function configure (options: { effect?: Effect | null }): void;

/** A keyed list: rows keep their nodes when they move. Without key the position is the key. */
export declare function each<T> (items: Iterable<T> | (() => Iterable<T>), key: (item: T, index: number) => unknown, row: (item: T, index: number) => unknown): unknown;
export declare function each<T> (items: Iterable<T> | (() => Iterable<T>), row: (item: T, index: number) => unknown): unknown;

/** One of two branches. A function as condition is followed live when an effect is set. */
export declare function when (condition: unknown, then: () => unknown, otherwise?: (() => unknown) | null): unknown;

/** Markup as it is, for a child hole, parsed only when it changed. Sanitize anything from someone else first. */
export declare function raw (html: string | null | undefined): unknown;

/** Whether a value is a template result. */
export declare function isResult (value: unknown): value is TemplateResult;

export default render;
