// internal/is.js — Prädikate. Keine Imports, keine Seiteneffekte.

export const

isArray   = Array.isArray,
isFn      = v => typeof v === 'function',
isString  = v => typeof v === 'string',
isNullish = v => v == null,

isObject = v => v !== null && typeof v === 'object' && !isArray(v),

isFragment   = v => v?.nodeType === 11,
isElementish = v => v?.nodeType === 1 || v?.nodeType === 9 || v?.nodeType === 11,

// DOM-Formen
isEDO      = v => isObject(v) && !isElementish(v) && !!(v.tag || v.tagName),
isHTML     = v => isString(v) && v.trim().startsWith('<'),
isIdLike   = v => isString(v) && v.charCodeAt(0) === 35 && !/[\s.]/.test(v),
isURL      = v => isString(v) && v.includes('://'),

// Form-Controls
isCheckable   = el => el?.type === 'checkbox' || el?.type === 'radio',
isMultiSelect = el => el?.tagName === 'SELECT' && el.multiple,

// Werte
isEmpty = v => v === '' || v === null || v === undefined;
