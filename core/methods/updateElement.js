// updateElement.js

import { flatNodes, isFn, isString, toList } from './../shared.js';
import { resolveElement }    from './resolveElement.js';
import { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible } from './../observer.js';

const observerEvents = { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible };

// Helper function to check if a property on the prototype chain is writable or has a setter
function isWritable (obj, key) {
  let current = obj;
  while (current) {
    const desc = Object.getOwnPropertyDescriptor(current, key);
    if (desc) return Boolean(desc.set || desc.writable);
    current = Object.getPrototypeOf(current);
  }
  return true;
}


export function updateElement (spec, props = {}, ...children) {
  const element = resolveElement(spec);
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

    else if (!isSVG && key in element && isWritable(element, key)) element[key] = value;
    else element.setAttribute(key, value);

  }

  const kids = flatNodes(children);
  if (kids.length) element.append(...kids);
  if (mountTo) resolveElement(mountTo)?.[mountFn](element);

  return element;
}

export default updateElement;
