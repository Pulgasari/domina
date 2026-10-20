// @domina/element :: lib/observe

/*
this.observe, @domina/observer bound to the element:

  this.observe.added('rat-view', view => …)      present now or added later, below the element
  this.observe.removed('rat-view', view => …)    taken out again
  this.observe.attr('open', ({ value, old }) => …)
  this.observe.resized(entry => …)
  this.observe.visible((visible, entry) => …)

each returns its stop and stops by itself when the element is disconnected, so
it belongs into onConnected. selectors are matched by element.matches(): no
:scope, a child relation is checked in the callback.
*/

import { observe } from '@domina/observer';

export function observerOf (element) {
  const watch = (target, handlers) => element.track(observe(target, handlers));
  const below = () => ({ within: element.root });

  return {
    added   : (selector, fn) => watch(selector, { ...below(), onMatch: node => fn.call(element, node) }),
    attr    : (name, fn)     => watch(element, { onAttr: { [name]: (node, change) => fn.call(element, change) } }),
    removed : (selector, fn) => watch(selector, { ...below(), onRemoved: node => fn.call(element, node) }),
    resized : fn             => watch(element, { onResize: (node, entry) => fn.call(element, entry) }),
    visible : fn             => watch(element, { onIntersect: (node, entry) => fn.call(element, entry.isIntersecting, entry) }),
  };
}
