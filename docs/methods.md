# methods

[adoptStylesheet](#adoptStylesheet)
[extractStylesheetImports](#extractStylesheetImports)

##

### `adoptStylesheet`

adoptStylesheet(source, options?) -> Promise<CSSStyleSheet|null>
source: css text, a url, a Response or an existing CSSStyleSheet.
adopted sheets cascade after author styles, so they override a page level <link> without !important.

```javascript
await adoptStylesheet('/themes/nord.css', {
  scope : 'aufbau-code[data-hljs-theme="nord"]',
  key   : 'hljs:nord',
});
```

options:
target  element, shadow root or document (default document)
scope   selector prefix applied to every rule
layer   wraps the css in @layer <name>, which makes it lose against every
        unlayered author rule. use for component base styles
key     dedup key, url plus scope plus layer by default. a repeated call
        with the same key returns the cached promise instead of adopting twice
replace swaps the content of an already adopted sheet in place, which keeps
        the cascade position stable when switching themes
imports what to do with @import rules, which a constructed sheet cannot carry.
        'keep' (default, they fall away and you get told once), 'comment',
        'strip', 'link' (each becomes a <link> in the head), or a function
        that receives the list
base    what a relative @import url resolves against. defaults to the source
        when that was a url or a Response, else document.baseURI

### `extractStylesheetImports`

extractStylesheetImports(css, options?) -> { code, imports }
the @import handling of adoptStylesheet on its own, for anything that builds a
CSSStyleSheet itself. knows both url forms, skips commented out rules and splits
layer(), supports() and the media query apart.

```javascript
const { code, imports } = extractStylesheetImports(css, { base, mode: 'strip' });
// imports -> [{ href, layer, media, rule, supports }, …]
```

options:
base  what a relative import url resolves against (default document.baseURI)
mode  what the returned code does with the rules it found:
      'comment' (default), 'strip' or 'keep'
