// @domina/core/sugar/stylesheet.js

import {
    adoptStylesheet  as adopt, 
      getStylesheets as get, 
      hasStylesheet  as has,
  releaseStylesheet  as release,
    scopeStylesheet  as scope,
      setStyleElement
} from './../methods/index.js';

/**
 * stylesheet('/themes/nord.css', { scope: '[data-theme="nord"]' })
 *   .adopt()            -> Promise<CSSStyleSheet|null>, idempotent
 *   .replace(css)       -> tauscht den Inhalt, behält die Cascade-Position
 *   .release()
 *   .adopted            -> ist das Sheet gerade übernommen
 *   .sheet              -> das CSSStyleSheet, sobald adopt() durch ist
 * Der Handle merkt sich Quelle und Optionen, damit man sie nicht bei jedem
 * Aufruf wiederholen muss.
 */
export const stylesheet = (source, options = {}) => {
  let sheet = null;

  const handle = {
    source,
    options,

    get sheet   () { return sheet; },
    get adopted () { return !!sheet && has(sheet, options); },

    adopt : async () => { sheet = await adopt(source, options); return sheet; },

    replace : async css => {
      sheet = await adopt(css ?? source, { ...options, replace: true });
      return sheet;
    },

    release : async () => {
      const released = await release(sheet ?? options.key, options);
      sheet = null;
      return released;
    },

    scope : selector => { if (sheet) scope(sheet, selector); return handle; },
  };

  return handle;
};

/**
 * stylesheets()            -> die adoptierten Sheets des Dokuments
 * stylesheets(shadowRoot)  -> die eines Shadow Roots
 * stylesheets(el).add(css) -> adoptieren
 */
export const stylesheets = (target = document) => {
  const options = { target };

  return {
    target,

    get list   () { return get(options); },
    get length () { return get(options).length; },

    add    : (source, extra = {}) => adopt(source, { ...options, ...extra }),
    remove : sheetOrKey           => release(sheetOrKey, options),
    has    : sheet                => has(sheet, options),
    clear  : async () => { for (const sheet of get(options)) await release(sheet, options); },

    // <style id="…">
    inline : setStyleElement,
  };
};
