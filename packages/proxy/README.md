# @domina/proxy

`domina` is a facade for `document`: it reads like `document`, hands back real nodes, touches
no prototype, and fills the gaps where the native api throws or does nonsense. a native call
stays native. short forms are `@domina/chain`'s job (`d`, `dd`), both together are
`@domina/dom`.

```js
import domina from '@domina/proxy';

// native names, a spec object fills the gap
domina.querySelector('#some-element');
domina.querySelector({ id: 'some-element' });
domina.querySelectorAll({ tag: 'li', class: 'done' });       // a NodeList, as natively

domina.getElement('#app');                                    // the first match or null
domina.getElements('.card').find({ active: true });           // a List: find/filter take a matcher or selector
domina.get('#app');  domina.getList('.card');                 // short names, to find out which reads better

// props and children fill the gap ({ is } and strings stay native)
domina.createElement('button', { class: 'primary', onClick: save }, 'save');

// delegation and several types fill gaps, a disposer comes back (natively undefined)
const stop = domina.addEventListener('click', '[data-action]', handler);
domina.addEventListener('keydown keyup', handler, { passive: true });
domina.removeEventListener('click');                          // every listener for click added through domina

// below an element or in a shadow root
domina.within('#card').getElement('.title');
```

## properties

everything native reads and writes as on `document` (`domina.title = '…'`). an unknown write
throws instead of leaving an expando. on top:

| | |
|---|---|
| `root` | the element of the facade: `<html>`, or the element of `within()` |
| `meta` | `meta.description`, `meta.og.image`, `meta['og:image']`, `meta.themeColor`. `null` or `delete` removes, `Object.keys()` lists |
| `url` | the page's url as `@pulgasari/url`, a copy |
| `observer` | `@domina/observer` |
| `a11y` | `reducedMotion`, `contrast`, `forcedColors`, `reducedTransparency` |
| `media` | `dark`, `light`, `hover`, `coarse`, `print`, `matches(query)`, `on(query, fn)` |

`domina.extend({ … })` adds members to every facade (methods, getters, setters). a name domina
or `document` has already throws.

## files

| | |
|---|---|
| `index.js` | `domina`, `within`, `extend` |
| `facade.js` | the proxy: members first, then the root, writes checked |
| `members.js` | what a facade adds |
| `events.js` | add/removeEventListener with delegation, several types, a registry per root |
| `meta.js`, `media.js`, `query.js` | `meta`, `a11y` + `media`, `List` |
| `_trash/` | the earlier construction (spaces, watch, snapshot, mirror, short forms) to look through |

## todo

- [ ] `_fonts.js` (ehem. `@domina/fonts`) integrieren
- [ ] `_forms.js` (ehem. `@domina/forms`) integrieren
- [ ] `_raf.js` (ehem. `@domina/raf`) integrieren
- [ ] `_sheets.js` (ehem. `@domina/sheets`) integrieren
- [ ] `_trash/` durchsehen: was davon (vars, data, class, scroll, focus, ready, watch …) zurückkommt
- [ ] `url` schreibbar (history) oder nur lesen?
- [x] `_meta.js` integriert (`meta.js`)
