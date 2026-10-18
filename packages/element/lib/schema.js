import { CanonicalMap, isArray, isFn, isPlainObject, toCamelCase, toKebabCase } from './shared.js';

const TYPES  = { boolean: Boolean, number: Number, string: String };
const typeOf = value => isArray(value) ? Array : isPlainObject(value) ? Object : TYPES[typeof value] ?? String;

// values no attribute can carry: such an entry is a property, stored on the instance
const RICH = new Set([Array, Function, Object]);

const cache = new WeakMap;

// prop: a stored value without attribute, state: the same without a public accessor
function entryOf (key, spec) {
  const entry = { name: toCamelCase(key), attribute: toKebabCase(key), type: String, fallback: undefined, values: null, fn: null, var: null, prop: false, state: false, hasChanged: null, onChange: null, reflect: false, schema: null };

  if (isFn(spec)) entry.type = spec;
  else if (isPlainObject(spec)) {
    entry.type       = spec.type ?? typeOf(spec.default);
    entry.fallback   = spec.default;
    entry.values     = isArray (spec.values)     ? spec.values     : null;
    entry.fn         = isFn    (spec.fn)         ? spec.fn         : null;
    entry.var        = spec.var === true ? `--${entry.attribute}` : (spec.var ?? null);
    entry.prop       = spec.prop  === true;
    entry.state      = spec.state === true;
    entry.hasChanged = isFn    (spec.hasChanged) ? spec.hasChanged : null;
    entry.onChange   = isFn    (spec.onChange)   ? spec.onChange   : null;
  }
  else if (spec != null) {
    entry.type     = typeOf(spec);
    entry.fallback = spec;
  }

  if (RICH.has(entry.type)) entry.prop = true;
  if (entry.state) entry.prop = false;

  return Object.freeze(entry);
}

// ::: static props

/*
static props = { name: schema | String | Number | Boolean | { type, onChange, reflect } }

a schema is any standard schema ('~standard': @rat/types, zod, valibot …). it
gives the start value (its initial, @rat/types has one), reads the attribute
string (a @rat/types Num takes '120' as 120) and checks every value set. a
value that fails is warned about and the old one stays. simple values (bool,
enum, num, str, or a primitive initial) live in the attribute and are
reflected, anything else (a list, a record) is a stored prop.
*/

export const isStandard = value => value != null && typeof value === 'object' && '~standard' in value;

const SIMPLE = new Set(['bool', 'enum', 'num', 'str']);

const isSimple = schema => SIMPLE.has(schema.kind) || ['boolean', 'number', 'string'].includes(typeof schema.initial);

// { value } or { issues }, an async schema counts as a failure: a prop is set synchronously
export function check (schema, value) {
  const result = schema['~standard'].validate(value);
  return typeof result?.then === 'function' ? { issues: [{ message: 'an async schema can not check a prop' }] } : result;
}

function propEntryOf (key, spec) {
  const definition = isStandard(spec) || isFn(spec) ? { type: spec } : spec;
  const { onChange, reflect, type, ...rest } = definition;

  if (!isStandard(type)) {
    const entry = entryOf(key, { ...rest, type });
    return Object.freeze({ ...entry, fromProps: true, onChange: isFn(onChange) ? onChange : null, reflect: reflect ?? !entry.prop });
  }

  const simple = isSimple(type);
  const entry  = entryOf(key, type.kind === 'bool' ? Boolean : String);
  return Object.freeze({ ...entry, fallback: type.initial, fromProps: true, onChange: isFn(onChange) ? onChange : null, prop: !simple, reflect: reflect ?? simple, schema: type });
}

// an entry that lives in an attribute, as opposed to a stored prop or state
export const isAttribute = entry => !entry.prop && !entry.state;

// a name outside the schema: a string attribute, nothing more
export const looseEntry = key => entryOf(key);

const own = (Class, key) => Object.hasOwn(Class, key) && Class[key];

function attrOwners (Class) {
  const owners = [];
  for (let c = Class; isFn(c); c = Object.getPrototypeOf(c)) {
    if (own(c, 'attr') || own(c, 'props')) owners.unshift(c);
  }
  return owners;
}

// attr: { name: spec } or a list of names
export function schemaOf (Class) {
  if (cache.has(Class)) return cache.get(Class);

  const schema = new CanonicalMap(null, ['kebab', 'camel', 'snake']);
  for (const owner of attrOwners(Class)) {
    const attr  = own(owner, 'attr');
    const specs = !attr ? [] : isArray(attr) ? attr.map(name => [name, String]) : Object.entries(attr);
    for (const [key, spec] of specs) schema.set(key, entryOf(key, spec));
    for (const [key, spec] of Object.entries(own(owner, 'props') || {})) schema.set(key, propEntryOf(key, spec));
  }

  cache.set(Class, schema);
  return schema;
}

// the names reflected into their attribute: static reflect, and the props that reflect
const reflected = new WeakMap;

export function reflectedOf (Class) {
  if (!reflected.has(Class)) reflected.set(Class, [...new Set([...(Class.reflect ?? []), ...[...schemaOf(Class).values()].filter(entry => entry.reflect && isAttribute(entry)).map(entry => entry.name)])]);
  return reflected.get(Class);
}
