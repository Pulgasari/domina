![Logo](/logo.svg)

# @domina

- `@domina/methods`;

## @domina/methods

---

# problematik

die methods providen zwar handy utils, um mit dem dom zu arbeiten, aber dadurch, dass sie nicht teil des prototypes selbst sind, können sie ihre DX überhaupt nicht richtig entfalten.

so schlucken `getElement`/`getElements` oder `onEvent` zwar so ziemlich jeden erdenklichen type/shape, der in der praxis auftritt ...

```js
const sidebar = getElement('#sidebar');
const panel   = getElement({ name: 'irgendwas', class: 'panel' });
const element = getElement(sidebar);
```

... aber bei den children/siblings/usw fehlts dann wieder und man nutzt entweder dort dann doch wieder die originalmethoden wie `element.querySelectorAll('...')` und `element.addEventListener(...)` oder kombiniert das direkt/indirekt mit den domina-methods o.ä. 

jedenfalls endet msn bei uneinheitlichem code, der *hier* mal nice dx-freundliche interface hat und *dort* dann direkt wieder messy ist usw.

und viele methods sind eigtl nur deswegen nötig.

## `@domina/prototype`

hier knallt domina nur ne handvoll methods an den prototype und unterm strich kann man damit viel sauberer arbeiten und dx-freundlich arbeiten.

## `@domina/prototype-hc` (concept)

es juckt mich glatt ne hardcore-variante zu machen, die vorsätzlich, bewusst und direkt die originalmethoden targeted und enhanced.

## `@domina/chain`(concept)

(async) jquery-like chain (aber nicht `$` sonderm `dom` oder `d`)

## `@domina/proxy' (concept)

kp ob das in praxis geht, aber komplett proxy um `document`, der dann als `domina` referenziert wird?

---

# todo
- [ ] rename `@domina/methods` to `@domina/verbs` (?)
- [ ] rename `@domina/prototype` to `@domina/prototypes` (?)
