// @domina/core/methods/updateElement.js

import { isFn, isString }    from './internal/is.js';
import { flatNodes, toList } from './internal/normalize.js';
import { _el }               from './internal/resolve.js';
import { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible } from './observer.js';

const observerEvents = { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible };

export default const updateElement = (spec, props = {}, ...children) => {
  const element = _el(spec);
  if (!element) return null;

  // SVG-Elemente haben read-only Props (className, href) -> immer setAttribute
  const isSVG = element instanceof SVGElement;
  let mountFn, mountTo;

  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;

    if      (key === 'appendTo')  { mountTo = value; mountFn = 'append';  }
    else if (key === 'prependTo') { mountTo = value; mountFn = 'prepend'; }

    else if (key === 'style') {
      if (isString(value)) element.setAttribute('style', value);
      else for (const [property, val] of Object.entries(value))
        property.includes('-') ? element.style.setProperty(property, val) : (element.style[property] = val);
    }

    else if (key === 'dataset' || key === 'data') {
      Object.assign(element.dataset, value);
    }

    else if (key === 'class' || key === 'className') {
      element.setAttribute('class', toList(value).join(' '));
    }

    else if (key.startsWith('on') && isFn(value)) {
      const observerFn = observerEvents[key];
      observerFn ? observerFn(element, value)
                 : element.addEventListener(key.slice(2).toLowerCase(), value);
    }

    else if (!isSVG && key in element) element[key] = value;
    else element.setAttribute(key, value);
  }

  const kids = flatNodes(children);
  if (kids.length) element.append(...kids);
  if (mountTo) _el(mountTo)?.[mountFn](element);

  return element;
};
