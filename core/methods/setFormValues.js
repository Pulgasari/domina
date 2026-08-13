// setFormValues.js

import { _el }          from './../resolve.js';
import { isArray }      from './../vendors.js';
import { setValue }     from './setValue.js';
import { notifyChange } from './notifyChange.js';

const SKIP = ['submit', 'reset', 'button', 'image'];

const controlsOf = (form, includeDisabled) =>
  [...form.elements].filter(el =>
    el.name && !SKIP.includes(el.type) && (includeDisabled || !el.disabled));

export const setFormValues = (form, values = {}, { notify = false, missing = 'skip' } = {}) => {
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

    if (notify) group.forEach(notifyChange);
  }

  return $f;
};

export default setFormValues;
