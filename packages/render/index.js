// @domina/render
// @ts-self-types="./index.d.ts"
// renders a template into a target again and again and writes only what changed.
// no vdom, no tree diff: the static parts of a template are cloned once, every
// hole becomes a part that compares its last value with the new one. the
// renderer knows no syntax, it takes programs (see concept.md); a syntax such as
// htx turns its template literals into programs through tag().
//
//   import { program }     from '@htx/htx';
//   import { render, tag } from '@domina/render';
//
//   const html = tag(program);
//   render(container, html`<p>${text}</p>`);   // first call clones, later calls patch

import { DIRECTIVE, RESULT, defaults, render, unrender } from './parts.js';

// a template tag over a parser: (strings) -> program. the parser is asked once
// per template literal, the strings array is the same object on every call
function tag (parse) {
  const programs = new WeakMap;
  return (strings, ...values) => {
    let program = programs.get(strings);
    if (!program) programs.set(strings, program = parse(strings));
    return { [RESULT]: true, program, values };
  };
}

// a function in a value hole is live once an effect function is set: globally
// here, or per call as render(target, result, { effect, scope }).
//
//   effect(fn)  runs fn now and again on every change, returns its dispose. it
//               must belong to no one else: the renderer disposes it
//   scope(fn, anchor)  runs fn untracked as owner of what it creates, returns
//               [result, dispose]. components, rows and branches are built in
//               one, so their own effects and cleanups go when they go. anchor:
//               the comment the part starts at, where in the page it is built
function configure ({ effect, scope } = {}) {
  if (effect !== undefined) defaults.effect = effect;
  if (scope  !== undefined) defaults.scope  = scope;
}

// :::::: HELPERS
// plain values a child hole understands. a function as `items`, `condition` or
// `subject` is followed live when an effect function is set; rows and branches
// are then built once per key and kept (see parts.js)

// a keyed list: each(items, key, row, otherwise), or each(items, row) keyed by
// position. otherwise renders while the list is empty
function each (items, key, row, otherwise = null) {
  if (row === undefined) { row = key; key = (item, index) => index; }
  return { [DIRECTIVE]: 'each', key, otherwise, row, source: items };
}

// the case whose value is the subject (Object.is), or otherwise:
// match(subject, [['grid', () => html`…`], ['list', () => html`…`]], () => html`…`)
function match (subject, cases, otherwise = null) {
  return { [DIRECTIVE]: 'match', cases, otherwise, source: subject };
}

// one of two branches: when(condition, () => html`…`, () => html`…`)
function when (condition, then, otherwise = null) {
  return { [DIRECTIVE]: 'when', otherwise, source: condition, then };
}

// markup as it is, for a child hole: raw(markdownHtml). it is parsed, so anything
// from someone else's hands belongs in a sanitizer first
function raw (html) {
  return { [DIRECTIVE]: 'raw', html };
}

const isResult = value => value?.[RESULT] === true;

export { configure, each, isResult, match, raw, render, tag, unrender, when };
export default render;
