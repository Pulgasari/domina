![Logo](/logo.svg)

---

# info

die packages wurden nochmal umstrukturiert:

## `@domina/dom`

kombiniert `@domina/proxy` (`dom`, wie `document`), `@domina/chain` (`d`, `dd`, wie `$`, `$$`) und `@domina/observer` (`dom.observer`).

## fighting the dom
- `@domina/chain`: jQuery-like interface mit kurzen identifieren
- `@domina/verbs`: einzelne funktionen (`getElement`, `setMeta` …), vormals `@domina/methods`
- `@domina/prototypes`: evtl. deprecated
- `@domina/proxy`: fassade für `document`, native namen, lücken gefüllt
- `@domina/observer`:

## render html
- `@domina/render`
- `@domina/element`: basisklasse zur erstellung von webcomponents
  -  `@htx` + `@domina/render`
  -  `@aufbau/gestures`
  -  `@domina/proxy`
  -  `@domina/observer`

# todo
- [x] rename `@domina/methods` to `@domina/verbs`
- [x] `@domina/dom`: `dom` (proxy, callable as `d`), `d`, `dd`, `dom.observer`. proxy und chain bleiben zwei apis
- [ ] `@pulgasari/url` als `@domina/url`? (mit `domina.url` am ende nochmal anschauen)
- [x] rename `@domina/prototype` to `@domina/prototypes`
