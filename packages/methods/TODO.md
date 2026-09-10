# todo

## migration (@domina/methods)

- [ ] resolve external: `updateElement` imports `@domina/observer` (formerly `core/observer.js`).
      observer becomes its own package; add the import-map mapping and dependency at the core-move.
- [ ] jsr publish blocker: `_shared.js` re-exports via `https://code.pulgasari.dev/...`.
      jsr disallows http imports; move to `jsr:`/`npm:` specifiers or an import map before `deno publish`.

## methods

- [ ] cleanup + utilize: `adoptStylesheet`
- [ ] cleanup + utilize: `getNextAll`, `getParents`, `getPrevAll`
- [ ] cleanup + utilize: `onEvent`, `offEvent`, `delegateEvent`
- [ ] create: generell schauen wegen singular/plural-varianten
- [ ] create: `on`
- [ ] create: `once`
- [ ] create: `clearClassList`
- [ ] create: `copyClassList`
- [ ] create: `defineCustomProperty` (oder `createCustomProperty` ???)
- [ ] create: `setClassList`
- [ ] enhance: `getStyle`
- [ ] enhance: `setStyle`
- [ ] fix: `onceEvent` -> wrong behaviour
- [ ] rename: `delegateEvent` ???
- [ ] rename: `emitEvent` ???
- [ ] rename: `notifyChange` -> `emitValueChange` ???
- [ ] rename: `scopeStylesheet` and the others to `scopeStyleSheet` ???
- [ ] rename: `waitForEvent` ???
