// @domina/core/stylesheet.js

import { _el } from './internal/resolve.js';
import { isString } from './internal/is.js';
import { updateElement } from './element.js';
import { upsertHead } from './head.js';

// :::::: <style>-Elemente

/**
 * setStyleElement(css)                   -> anonymes <style>, jedes Mal neu
 * setStyleElement(css, { id: 'theme' })  -> idempotent, ersetzt den Inhalt
 * setStyleElement(null, { id: 'theme' }) -> entfernt
 */
export const setStyleElement = (css, { id, media } = {}) => {
  if (css === null && id) {
    document.getElementById(id)?.remove();
    return null;
  }

  const element = id
    ? upsertHead(`style#${id}`, () => updateElement(document.createElement('style'), { id }))
    : updateElement(document.createElement('style'), { appendTo: document.head });

  element.textContent = String(css ?? '');
  if (media) element.media = media;
  return element;
};

export const updateStyleElement = setStyleElement;

// :::::: Constructable Stylesheets

// root -> Map<key, Promise<CSSStyleSheet|null>>
const registry = new WeakMap;
const isSheet  = v => typeof CSSStyleSheet !== 'undefined' && v instanceof CSSStyleSheet;
const isCssUrl = v => isString(v) && (/^(https?:|blob:|data:|\.{0,2}\/)/.test(v) || /\.css($|[?#])/.test(v));

// wraps css in a cascade layer. adopted sheets come after author styles, so an
// unlayered sheet wins at equal specificity. that is right for an override and
// wrong for base styles, which belong in a layer so page css beats them again.
const layered = (css, layer) => layer ? `@layer ${layer} { ${css} }` : String(css);

/**
 * where the sheet gets adopted. a shadow root or document is used as is,
 * an element resolves to its own shadow root when it has one, else to its
 * containing document or shadow root.
 */
const rootOf = target => {
  if (!target) return document;
  if (target.nodeType === 9 || target.nodeType === 11) return target;
  const element = _el(target);
  if (!element) return document;
  return element.shadowRoot ?? element.getRootNode?.() ?? document;
};

const storeOf = root => {
  let store = registry.get(root);
  if (!store) registry.set(root, store = new Map);
  return store;
};

const fetchCss = async source => {
  if (typeof Response !== 'undefined' && source instanceof Response) return source.text();
  if (!isCssUrl(source)) return String(source);

  const response = await fetch(source);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} - ${source}`);
  return response.text();
};

export const

/**
 * prefixes every selector of a sheet or rule list so several sheets can coexist
 * on one page. descends into @media, @supports and @layer. :root is replaced by
 * the scope rather than nested inside it.
 */
scopeStylesheet = (sheetOrRules, scope) => {
  const rules = sheetOrRules?.cssRules ?? sheetOrRules;
  if (!rules || !scope) return sheetOrRules;

  for (const rule of rules) {
    if (rule.selectorText) {
      rule.selectorText = rule.selectorText
        .split(',')
        .map(selector => {
          const trimmed = selector.trim();
          return trimmed.startsWith(':root') ? trimmed.replace(':root', scope) : `${scope} ${trimmed}`;
        })
        .join(', ');
    } else if (rule.cssRules) {
      scopeStylesheet(rule.cssRules, scope);
    }
  }
  return sheetOrRules;
},

/** css text -> constructable stylesheet, optionally scoped and layered */
createStylesheet = (css, { scope = null, layer = null, media, disabled = false } = {}) => {
  const sheet = new CSSStyleSheet(media ? { media } : undefined);
  sheet.replaceSync(layered(css, layer));
  if (scope) scopeStylesheet(sheet, scope);
  sheet.disabled = disabled;
  return sheet;
},

adoptStylesheet = (source, { target = document, scope = null, layer = null, key, replace = false, media } = {}) => {
  if (typeof CSSStyleSheet === 'undefined' || !('adoptedStyleSheets' in Document.prototype)) {
    return Promise.resolve(null);
  }

  const root  = rootOf(target);
  const store = storeOf(root);
  const id    = key ?? (isCssUrl(source) ? `${source}::${scope ?? ''}::${layer ?? ''}` : null);

  if (id && store.has(id) && !replace) return store.get(id);

  const promise = (async () => {
    const existing = id && replace ? await store.get(id) : null;

    if (isSheet(source)) {
      if (scope) scopeStylesheet(source, scope);
      if (!root.adoptedStyleSheets.includes(source)) {
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, source];
      }
      return source;
    }

    const css = await fetchCss(source);

    // reuse the existing sheet object so its position in the cascade survives
    if (existing) {
      existing.replaceSync(layered(css, layer));
      if (scope) scopeStylesheet(existing, scope);
      return existing;
    }

    const sheet = createStylesheet(css, { scope, layer, media });
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return sheet;
  })().catch(error => {
    if (id) store.delete(id); // a failed load must not poison the cache
    console.warn('[domina] adoptStylesheet failed:', error);
    return null;
  });

  if (id) store.set(id, promise);
  return promise;
},

/** removes a sheet again. accepts the sheet itself or the key it was cached under */
releaseStylesheet = async (sheetOrKey, { target = document } = {}) => {
  const root  = rootOf(target);
  const store = storeOf(root);

  let sheet = sheetOrKey;
  if (isString(sheetOrKey)) {
    sheet = await store.get(sheetOrKey);
    store.delete(sheetOrKey);
  } else {
    for (const [key, pending] of store) if (await pending === sheet) store.delete(key);
  }

  if (!sheet) return false;
  root.adoptedStyleSheets = root.adoptedStyleSheets.filter(adopted => adopted !== sheet);
  return true;
},

/** true when the sheet is currently adopted on the given root */
hasStylesheet = (sheet, { target = document } = {}) => rootOf(target).adoptedStyleSheets.includes(sheet),

/** every sheet currently adopted on the given root */
getStylesheets = ({ target = document } = {}) => [...rootOf(target).adoptedStyleSheets];
