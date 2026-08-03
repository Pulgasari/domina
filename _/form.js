// form.js

import { _el }                from './core.js';
import { isArray, isString }  from './utils.js';
import { getValue, setValue } from './values.js';

const SKIP = ['submit', 'reset', 'button', 'image'];

const controlsOf = (form, includeDisabled) =>
  [...form.elements].filter(el =>
    el.name && !SKIP.includes(el.type) && (includeDisabled || !el.disabled));

export const

  getFormValues = (form, { trim = true, includeDisabled = false } = {}) => {
    const $f = _el(form);
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
      else       out[name] = v;
    }

    return out;
  },

  setFormValues = (form, values = {}, { notify = false, missing = 'skip' } = {}) => {
    const $f = _el(form);
    if (!$f?.elements) return null;

    const byName = {};
    for (const el of controlsOf($f, true)) (byName[el.name] ??= []).push(el);

    // 'clear' = Felder, die im Objekt fehlen, werden geleert
    const names = missing === 'clear'
      ? [...new Set([...Object.keys(byName), ...Object.keys(values)])]
      : Object.keys(values);

    for (const name of names) {
      const group = byName[name];
      if (!group) continue;

      const value = name in values ? values[name] : (missing === 'clear' ? null : undefined);
      if (value === undefined) continue;

      if (group[0].type === 'radio') {
        const v = value == null ? null : String(value);
        group.forEach(el => { el.checked = el.value === v; });
      }
      else if (group[0].type === 'checkbox' && group.length > 1) {
        const list = (isArray(value) ? value : [value]).map(String);
        group.forEach(el => { el.checked = list.includes(el.value); });
      }
      else {
        group.forEach(el => setValue(el, value));
      }

      if (notify) group.forEach(el => {
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    return $f;
  };
