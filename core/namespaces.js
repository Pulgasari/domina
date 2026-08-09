// namespaces.js

import { getFormValues, setFormValues } from './form';

// :::::: element + elements

// :::::: form

const form = (spec) => ({
  self : spec,
  // methods
  getValues : ()    => getFormValues (self),
  setValues : (obj) => setFormValues (self, obj),
});

// :::::: meta

const meta = {
  get : getMeta,
  set : setMeta,
};
