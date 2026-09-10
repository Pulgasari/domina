# todo

## migration (@domina/methods)

- [ ] circular dep: `updateElement` imports `@domina/observer`, which imports `@domina/methods`.
      resolves in the deno workspace; declare the dependency for the jsr publish. the cycle is
      runtime-safe (both sides use the imported bindings inside function bodies, not at module init).
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
