// @domina/chain/api.js
// the built-in methods, as definitions (see define.js)

import { getAttr }        from '@domina/methods/getAttr';
import { getElementSize } from '@domina/methods/getElementSize';
import { getHTML }        from '@domina/methods/getHTML';
import { getStyle }       from '@domina/methods/getStyle';
import { setAttr }        from '@domina/methods/setAttr';
import { setHTML }        from '@domina/methods/setHTML';
import { setStyle }       from '@domina/methods/setStyle';

// :::::: ATTRIBUTES

export const attr = {
  params : { name: 'string', value: 'string' },
  read   : (element, name)              => getAttr(element, name),
  write  : (element, nameOrMap, value)  => setAttr(element, nameOrMap, value),
};

// :::::: CONTENT

export const html = {
  params : { html: 'html' },
  read   : (element)       => getHTML(element),
  write  : (element, html) => setHTML(element, html),
};

// :::::: STYLES

export const style = {
  params : { property: 'string', value: 'string' },
  read   : (element, property)                => getStyle(element, property),
  write  : (element, propertyOrMap, value)    => setStyle(element, propertyOrMap, value),
};

// :::::: GEOMETRY

const onlyBox = options => Object.keys(options).every(key => key === 'box');

export const size = {
  object : true,
  params : { w: 'number', h: 'number', box: 'string' },
  reads  : ([options]) => options == null || onlyBox(options),

  read (element, { box } = {}) {
    const size = getElementSize(element, { box });
    return size && { h: size.height, w: size.width };
  },

  // only what is given is written, null removes
  write (element, { h, w }) {
    const styles = {};
    if (w !== undefined) styles.width  = w;
    if (h !== undefined) styles.height = h;
    setStyle(element, styles);
  },
};
