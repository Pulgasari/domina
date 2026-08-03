// update.js

import { _el } from './core.js';
import { isArray, isFn, isString, normalize } from './utils.js';
import { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible } from './observer.js';

const observerEvents = { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible };
// todo:
//updateHead
//updateTitle
//updateStylesheet

export const

updateElement = (spec, props = {}, ...children) => {
  const element = _el(spec); if (!element) return null;
  const isSVG   = element instanceof SVGElement; // SVG-Elemente haben read-only Props (className, href) -> immer setAttribute
  let mountFn, mountTo;

  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;

    // appendTo + prependTo
    else if (key ===  'appendTo') { mountTo = value; mountFn = 'append';  }
    else if (key === 'prependTo') { mountTo = value; mountFn = 'prepend'; }

    // style
    else if (key === 'style') {
      if (isString(value)) element.setAttribute('style', value);
      else for (const [p,v] of Object.entries(value))
        p.includes('-') ? element.style.setProperty(p, v) : (element.style[p] = v);
    }

    // dataset
    else if (key === 'dataset' || key === 'data')
    Object.assign(element.dataset, value);

    // class
    else if (key === 'class' || key === 'className')
    element.setAttribute('class', isArray(value) ? value.flat(Infinity).filter(Boolean).join(' ') : value);

    // event + observer
    else if (key.startsWith('on') && isFn(value)) {
      const observerFn = observerEvents[key]; observerFn 
        ? observerFn(element, value)
        : element.addEventListener(key.slice(2).toLowerCase(), value);
    }
    
    // prop + attribute
    else if (!isSVG && key in element) element[key] = value;
    else element.setAttribute(key, value);
    
  }

  const kids = normalize(children);
  if (kids.length) element.append(...kids);
  if (mountTo) _el(mountTo)?.[mountFn](element);

  return element;
};
