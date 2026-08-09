// @domina/sugar/form.js

import { _el } from './internal/resolve.js';

import { getFormValues, setFormValues } from '@domina/core/form.js';
import { offEvent, onEvent }            from '@domina/core/events.js';

class FormFacade {
  // construct
  constructor (spec) { this.raw = _el(spec); }

  // getter + setter
  get values ()    { return getFormValues(this.raw); }
  set values (obj) { setFormValues(this.raw, obj); }

  // methods: domina
  getValues      (options) { return getFormValues(this.raw, options); }
  setValues (obj, options) { setFormValues(this.raw, obj, options); return this; }

  // Event-Objekt-Mapping: form.on({ input: fn, submit: fn })
  on (listeners, options) {
    if (!this.raw) return () => {};
    const unbinds = Object.entries(listeners).map(([types, handler]) =>
      onEvent(this.raw, types, handler, options)
    );
    return () => unbinds.forEach(off => off());
  }

  // methods: form (native)
  checkValidity  () { return this.raw?.checkValidity() ?? false; }
  reportValidity () { return this.raw?.reportValidity() ?? false; }
  reset          () { this.raw?.reset(); return this; }
  submit         () { this.raw?.requestSubmit?.() ?? this.raw?.submit(); return this; }
}

// Factory Function, die die Instanz in einen Proxy hüllt
export const form = (spec) => {
  const instance = new FormFacade(spec);

  return new Proxy(instance, {
    get(target, prop, receiver) {
      // 1. Wenn die Eigenschaft/Methode auf der FormFacade existiert -> von der Klasse lesen
      if (prop in target) {
        const val = Reflect.get(target, prop, receiver);
        return typeof val === 'function' ? val.bind(target) : val;
      }

      // 2. Fallback: Feld-Zugriff per Name (form.username)
      if (typeof prop === 'string' && target.raw?.elements) {
        const control = target.raw.elements.namedItem(prop);
        if (control) return control;
      }

      return undefined;
    },

    set(target, prop, value, receiver) {
      // Eigene Properties der FormFacade normal setzen
      if (prop in target) {
        return Reflect.set(target, prop, value, receiver);
      }

      // Feld-Zuweisung per Name (z. B. form.username = 'Max')
      if (typeof prop === 'string' && target.raw?.elements) {
        const control = target.raw.elements.namedItem(prop);
        if (control) {
          setFormValues(target.raw, { [prop]: value });
          return true;
        }
      }

      return Reflect.set(target, prop, value, receiver);
    }
  });
};
