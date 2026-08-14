// @domina/core/methods/getFormValues.js

import { resolveElement } from './resolveElement.js';
import { isString }       from './../vendors.js';
import { getValue }       from './getValue.js';

const SKIP = ['submit', 'reset', 'button', 'image'];

const controlsOf = (form, includeDisabled) =>
  [...form.elements].filter(el =>
    el.name && !SKIP.includes(el.type) && (includeDisabled || !el.disabled));

export function getFormValues (form, { trim = true, includeDisabled = false } = {}) {
  const $f = resolveElement(form);
  if (!$f?.elements) return {};

  const controls = controlsOf($f, includeDisabled);

  // Mehrere Controls mit gleichem name -> Array
  const counts = {};
  for (const el of controls) counts[el.name] = (counts[el.name] ?? 0) + 1;

  const out = {};

  for (const el of controls) {
    const { name, type } = el;
    const many = counts[name] > 1;

    if (type === 'radio') {
      if (el.checked)          out[name] = el.value;
      else if (!(name in out)) out[name] = null;
      continue;
    }

    if (type === 'checkbox') {
      if (many) {
        out[name] ??= [];
        if (el.checked) out[name].push(el.value);
      } else {
        out[name] = el.checked;
      }
      continue;
    }

    if (type === 'file') {
      out[name] = el.multiple ? [...el.files] : (el.files[0] ?? null);
      continue;
    }

    let v = getValue(el);
    if (trim && isString(v)) v = v.trim();

    if (many) (out[name] ??= []).push(v);
    else      out[name] = v;
  }

  return out;
}

export default getFormValues;
