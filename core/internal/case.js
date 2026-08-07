// @domina/core/internal/case.js

const CACHE = new Map;
const LIMIT = 512;
const CLEAN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/; // already kebab or a single lowercase word -> nothing to do

const convertToKebab = str => String(str)
  .replace(/([a-z\d])([A-Z])/g, '$1 $2')
  .replace(/[-_.\s]+/g, ' ')
  .trim().toLowerCase().split(' ').filter(Boolean).join('-');

export const toKebabCase = str => {
  if (CLEAN.test(str)) return str;

  let hit = CACHE.get(str);
  if (hit === undefined) {
    if (CACHE.size >= LIMIT) CACHE.clear();
    CACHE.set(str, hit = convertToKebab(str));
  }
  return hit;
};

const upperFirst = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const toWords = (value) => String(value)
  .replace(/([a-z\d])([A-Z])/g, '$1 $2')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  .replace(/[\s\-_.]+/g, ' ')
  .trim()
  .toLowerCase()
  .split(' ')
  .filter(Boolean);

// :::::: UNARY TRANSFORMS

export const
capitalize     = value => String(value).charAt(0).toUpperCase() + String(value).slice(1),
toLowerCase    = value => value.toLowerCase (),
toUpperCase    = value => value.toUpperCase (),
toCamelCase    = value => toWords(value).map((word, index) => index ? upperFirst(word) : word).join(''),    
toConstantCase = value => toWords(value).join('_').toUpperCase(),
//toKebabCase    = value => toWords(value).join('-'),
toPascalCase   = value => toWords(value).map(upperFirst).join(''),
toSnakeCase    = value => toWords(value).join('_'),
toTitleCase    = value => toWords(value).map(upperFirst).join(' '),
trim           = value => value.trim      (),
trimEnd        = value => value.trimEnd   (),
trimStart      = value => value.trimStart (),
unquote        = value => String(value).replace(/^(['"`])([\s\S]*)\1$/, '$2');
