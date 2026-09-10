// updateElement.js

import { flatNodes, isFn, isString, toList } from './_shared.js';
import { resolveElement }    from './resolveElement.js';
// todo: observer becomes its own package @domina/observer.
// unresolved external for now, exact boundary + import-map mapping decided at the core-move.
import { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible } from '@domina/observer';

const observerEvents = { onAdded, onAttr, onConnected, onDisconnected, onRemoved, onResize, onVisible };

// :::::: HELPERS

const isSVG = sth => sth instanceof SVGElement; // svg-elements read-only props -> always use setAttribute



/**
 * Finds a property descriptor along the prototype chain and caches the result.
 *
 * @param {Object} obj
 * @param {string} key
 * @returns {PropertyDescriptor|undefined}
 */
const descriptorCache = new WeakMap;
export function getPropertyDescriptor (obj, key) {
  if (obj == null) return undefined;
  
  const proto = Object.getPrototypeOf(obj);
  if (!proto) return Object.getOwnPropertyDescriptor(obj, key);

  let keyMap = descriptorCache.get(proto);
  if (!keyMap) {
    keyMap = new Map;
    descriptorCache.set(proto, keyMap);
  }

  if (keyMap.has(key)) return keyMap.get(key);

  let current = obj;
  let descriptor;

  while (current) {
    descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) break;
    current = Object.getPrototypeOf(current);
  }

  keyMap.set(key, descriptor);
  return descriptor;
}

/**
 * Checks whether a property on an object or its prototype chain has a setter or is writable.
 */
export function isWritable (obj, key) {
  const desc = getPropertyDescriptor(obj, key);
  return !desc || Boolean(desc.set || desc.writable);
}


export function updateElement (spec, props = {}, ...children) {
  const element = resolveElement(spec);
  if (!element) return null;

  
  let mountFn, mountTo;

  //for (const [key, value] of Object.entries(props)) {
  for (const key in props) {
    const value = props[key];
    if (value == null) continue;

    if      (key === 'appendTo')  { mountTo = value; mountFn = 'append';  }
    else if (key === 'prependTo') { mountTo = value; mountFn = 'prepend'; }

    else if (key === 'style') {
      if (isString(value)) element.setAttribute('style', value);
        
      //else for (const [property, val] of Object.entries(value))
      //property.includes('-') ? element.style.setProperty(property, val) : (element.style[property] = val);

      else for (const property in value) {
        const val = value[property];
        property.includes('-') ? element.style.setProperty(property, val) : (element.style[property] = val);
      }
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

      // observerEvents[key]?.(element, value)
      // ?? element.addEventListener(key.slice(2).toLowerCase(), value);

      //onEvent(element, key, value);
    }

    else if (!isSVG(element) && key in element && isWritable(element, key)) element[key] = value;
    else element.setAttribute(key, value);

  }

  const kids = flatNodes(children);
  if (kids.length) element.append(...kids);
  if (mountTo)     resolveElement(mountTo)?.[mountFn](element);

  return element;
}

export default updateElement;
