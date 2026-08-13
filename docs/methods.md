# methods

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
