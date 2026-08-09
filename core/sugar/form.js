// @domina/core/sugar/form.js

import { _el } from '../internal/resolve.js';
import { getFormValues, setFormValues } from '../form.js';
import { onEvent } from '../events.js';

/**
 * form('#login')
 *   .values                  -> { email: '…', remember: true }
 *   .values = { email: '…' }
 *   .on({ input: fn, submit: fn })   -> off()
 *   .email                   -> das Control (RadioNodeList bei mehreren gleichen Namen)
 *   .email = 'a@b.c'         -> schreibt den Wert
 */
export const form = spec => {
  const raw = _el(spec);

  const api = {
    raw,

    get values ()       { return getFormValues(raw); },
    set values (values) { setFormValues(raw, values); },

    getValues : options         => getFormValues(raw, options),
    setValues : (values, options) => { setFormValues(raw, values, options); return proxy; },

    // Event-Objekt-Mapping: form.on({ input: fn, submit: fn })
    on : (listeners, options) => {
      if (!raw) return () => {};
      const unbinds = Object.entries(listeners).map(([types, handler]) => onEvent(raw, types, handler, options));
      return () => unbinds.forEach(off => off());
    },

    // native Form-API, aber null-sicher
    checkValidity  : () => raw?.checkValidity()  ?? false,
    reportValidity : () => raw?.reportValidity() ?? false,
    reset          : () => { raw?.reset(); return proxy; },
    submit         : () => { raw?.requestSubmit?.() ?? raw?.submit(); return proxy; },
  };

  // elements.namedItem findet auch Controls, die per form="id" ausserhalb stehen –
  // querySelector im Formular findet die nicht.
  const proxy = new Proxy(api, {
    get (target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === 'string' && raw?.elements) return raw.elements.namedItem(prop) ?? undefined;
      return undefined;
    },

    set (target, prop, value) {
      if (prop in target) { target[prop] = value; return true; }
      if (typeof prop === 'string' && raw?.elements?.namedItem(prop)) {
        setFormValues(raw, { [prop]: value });
        return true;
      }
      return false;
    },
  });

  return proxy;
};
