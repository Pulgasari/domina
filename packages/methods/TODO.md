# todo

## migration (@domina/methods)

- [ ] circular dep: `updateElement` imports `@domina/observer`, which imports `@domina/methods`.
      resolves in the deno workspace; declare the dependency for the jsr publish. the cycle is
      runtime-safe (both sides use the imported bindings inside function bodies, not at module init).
- [ ] publish dep not on jsr yet: `_shared.js` imports `@pulgasari/str` (mapped to
      `jsr:@pulgasari/str@^1.0.0`), but that package returns 404 on jsr. publish
      `@pulgasari/str` before `deno publish`. `@pulgasari/is` is on jsr (1.0.0).

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
