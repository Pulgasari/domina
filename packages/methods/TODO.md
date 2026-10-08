# todo

## migration (@domina/methods)

- [x] circular dep: `updateElement` imported `@domina/observer`, which imports `@domina/methods`.
      `updateElement` loads the observer on first use now, the static cycle is gone.
- [ ] publish dep not on jsr yet: `_shared.js` imports `@pulgasari/str` (mapped to
      `jsr:@pulgasari/str@^1.0.0`), but that package returns 404 on jsr. publish
      `@pulgasari/str` before `deno publish`. `@pulgasari/is` is on jsr (1.0.0).

## methods

- [ ] cleanup + utilize: `adoptStyleSheet`
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
- [x] rename: `scopeStylesheet` and the others to `scopeStyleSheet`
- [ ] rename: `waitForEvent` ???
