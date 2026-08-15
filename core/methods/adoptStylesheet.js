// adoptStylesheet.js

import { isFn, isString }           from './../shared.js';
import { createStylesheet }         from './createStylesheet.js';
import { extractStylesheetImports } from './extractStylesheetImports.js';
import { resolveElement }           from './resolveElement.js';
import { scopeStylesheet }          from './scopeStylesheet.js';
import { setLink }                  from './setLink.js';

// Constructable Stylesheets state registry
export const registry = new WeakMap;
export function isCssUrl (v) { return isString(v) && (/^(https?:|blob:|data:|\.{0,2}\/)/.test(v) || /\.css($|[?#])/.test(v)); }    
export function isSheet  (v) { return typeof CSSStyleSheet !== 'undefined' && v instanceof CSSStyleSheet; }      
export function layered (css, layer) { return layer ? `@layer ${layer} {${css} }` : String(css); }

/**
 * Where the sheet gets adopted. A shadow root or document is used as is,
 * an element resolves to its own shadow root when it has one, else to its
 * containing document or shadow root.
 */
export function rootOf (target) {
  if (!target) return document;
  if (target.nodeType === 9 || target.nodeType === 11) return target;
  const element = resolveElement(target);
  if (!element) return document;
  return element.shadowRoot ?? element.getRootNode?.() ?? document;
}

export function storeOf (root) {
  let store = registry.get(root);
  if (!store) registry.set(root, store = new Map);
  return store;
}

const fetchCss = async source => {
  if (typeof Response !== 'undefined' && source instanceof Response) return source.text();
  if (!isCssUrl(source)) return String(source);

  const response = await fetch(source);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} -${source}`);
  return response.text();
};

// what a relative @import resolves against: the sheet it stands in, not the page
const baseOf = (source, base) => {
  if (base) return base;
  if (typeof Response !== 'undefined' && source instanceof Response) return source.url;
  if (isCssUrl(source) && typeof document !== 'undefined') return new URL(source, document.baseURI).href;
  return typeof document === 'undefined' ? undefined : document.baseURI;
};

const dropNotice = (list) => console.info(
  `[domina] adoptStylesheet: ${list.length} @import rule(s) dropped — a constructed` +
  ' stylesheet cannot carry them. hang them into <head> instead:\n\n' +
  "    adoptStylesheet(source, { imports: 'link' })\n\n" +
  list.map(item => `  ${item.href}`).join('\n')
);

/*
  @import has to leave the text before it reaches replaceSync, which drops the rules
  per spec, and before layered() wraps everything in @layer — an @import inside a
  layer block is invalid css either way.

  the default is 'keep', so nothing changes for callers that never thought about it;
  they just get told once that it happened.
*/
function handleImports (css, { base, imports, source }) {
  const mode =
      imports === 'keep'                   ? 'keep'
    : imports === 'strip' || isFn(imports) ? 'strip'
    :                                        'comment';

  const { code, imports: found } = extractStylesheetImports(css, { base: baseOf(source, base), mode });
  if (!found.length) return css;

       if (imports === 'keep') dropNotice(found);
  else if (isFn(imports))      imports(found);
  else if (imports === 'link') {
    for (const item of found) {
      // a <link> has no way to express layer(), that part of the rule is lost
      if (item.layer !== null) console.warn(`[domina] adoptStylesheet: dropping layer(${item.layer}) from ${item.href}, a <link> cannot carry it`);
      setLink({ href: item.href, rel: 'stylesheet', ...(item.media && { media: item.media }) });
    }
  }

  return code;
}

export function adoptStylesheet (source, { target = document, scope = null, layer = null, base, imports = 'keep', key, replace = false, media } = {}) {
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

    const css = handleImports(await fetchCss(source), { base, imports, source });

    // Reuse the existing sheet object so its position in the cascade survives
    if (existing) {
      existing.replaceSync(layered(css, layer));
      if (scope) scopeStylesheet(existing, scope);
      return existing;
    }

    const sheet = createStylesheet(css, { scope, layer, media });
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return sheet;
  })().catch(error => {
    if (id) store.delete(id); // A failed load must not poison the cache
    console.warn('[domina] adoptStylesheet failed:', error);
    return null;
  });

  if (id) store.set(id, promise);
  return promise;
}

export default adoptStylesheet;
