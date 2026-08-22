// @domina/core/sugar/stylesheet.js

import {
  adoptStylesheet, 
  getStylesheets, 
  hasStylesheet,
  releaseStylesheet,
  scopeStylesheet,
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
    get adopted () { return !!sheet && hasStylesheet(sheet, options); },

    adopt : async () => { sheet = await adoptStylesheet(source, options); return sheet; },

    replace : async css => {
      sheet = await adoptStylesheet(css ?? source, { ...options, replace: true });
      return sheet;
    },

    release : async () => {
      const released = await releaseStylesheet(sheet ?? options.key, options);
      sheet = null;
      return released;
    },

    scope : selector => { if (sheet) scopeStylesheet(sheet, selector); return handle; },
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

    get list   () { return getStylesheets(options); },
    get length () { return getStylesheets(options).length; },

    add    : (source, extra = {}) => adoptStylesheet(source, { ...options, ...extra }),
    remove : sheetOrKey           => releaseStylesheet(sheetOrKey, options),
    has    : sheet                => hasStylesheet(sheet, options),
    clear  : async () => { for (const sheet of getStylesheets(options)) await releaseStylesheet(sheet, options); },

    // <style id="…"> statt Constructable Sheet – für alles, was der Nutzer sehen soll
    inline : setStyleElement,
  };
};
