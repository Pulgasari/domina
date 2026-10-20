# @domina/proxy – Konzept

`domina` ist eine Fassade für `document`: Sie liest sich wie `document`, liefert echte Knoten, fasst keinen Prototyp an und macht die Arbeit mit dem DOM trotzdem angenehm. 

Es ist ein konzeptioneller Mittelweg zwischen:
- `@domina/chain` (Wrapper, der eigene Objekte zurückgibt)
- `@domina/verbs` (nice DX im Ergebnis immer nur auf der aktuellen Selector-Ebene).
- `@domina/prototypes` (verändert das DOM des ganzen Realms)

```js
import domina from '@domina/proxy';

domina.title       = 'Inbox (3)';
domina.vars.accent = 'tomato';
domina.data.theme  = 'dark';

const app  = domina.get('#app');                          // a real element
const rows = domina.getList({ tag: 'tr', class: 'row' }); // a real array
const stop = domina.on('click', '[data-action]', (event, el) => run(el.dataset.action));

// and '@domina/chain' is included, too
domina('.card').style({ opacity: 1 });
```

Die Namen spiegeln das Vorbild: 
- `domina` zu `document`
- `d`/`dd` zu `$`/`$$` (jQuery, DevTools)

## Stand

Gebaut ist alles aus diesem Konzept, mit den Entscheidungen, die in der Ankreuzliste ([15](#15-offene-fragen)) als Vorgabe stehen. `$`/`$$` heißen `get`/`getList`.

| Datei | |
|---|---|
| `facade.js` | der Proxy, das Register (`api`, Mitglieder, Bereiche), `createFacade(root)` |
| `members.js` | Zustand und Umgebung als Werte (`title`, `lang`, `scroll`, `ready` …) |
| `mirror.js` | gespiegelte Methoden von `document` und die Kurzformen (`get`, `getList`, `on` …) |
| `space.js` | `space()`: ein Bereich als Proxy |
| `spaces.js` | `vars`, `data`, `attr`, `class`, `meta`, `id`, `forms`, `values` |
| `watch.js` | Pfade → Observer und Ereignisse |
| `index.js` | Verdrahtung, `set`, `snapshot`, `watch`, `within`, `extend`, `space` |

Listener teilt `domina` mit `@domina/chain` (`listen`/`unlisten`): `domina.off('click')` findet, was `d(document).on('click', …)` angemeldet hat, und umgekehrt.

---

## Inhalt
- [1. Grundregeln](#1-grundregeln)
- [2. Die Ebenen](#2-die-ebenen)
- [3. Aufruf: `domina()`](#3-aufruf-domina)
- [4. Gespiegelte Methoden von `document`](#4-gespiegelte-methoden-von-document)
- [5. Kurzformen](#5-kurzformen)
- [6. Dokumentzustand](#6-dokumentzustand)
- [7. Umgebung und Lebenszyklus](#7-umgebung-und-lebenszyklus)
- [8. Mehrere Werte auf einmal](#8-mehrere-werte-auf-einmal)
- [9. Beobachten](#9-beobachten)
- [10. Bereiche: `domina.within()`](#10-bereiche-dominawithin)
- [11. Erweitern](#11-erweitern)
- [12. Aufbau im Code](#12-aufbau-im-code)
- [13. Kosten](#13-kosten)
- [14. Einordnung](#14-einordnung)
- [15. Offene Fragen](#15-offene-fragen)

---

## 1. Grundregeln

Aus der Machbarkeit folgen die Regeln, nicht umgekehrt.

1. **Echte Knoten raus, nie Proxies.** Native APIs lehnen Proxies als Argument ab (Brand Checks: `append`, `MutationObserver.observe`, `Range`, `WeakMap`-Schlüssel nehmen sie zwar, aber mit falscher Identität). Alles, was `domina` zurückgibt, ist ein natives Element, Array, Promise oder ein einfacher Wert.
2. **`domina` selbst wird nie an native APIs übergeben.** Dafür gibt es `domina.document`.
3. **Unbekanntes Lesen geht an `document` durch**, Funktionen gebunden. `domina.elementFromPoint(x, y)`, `domina.fonts`, `domina.visibilityState` funktionieren wie gewohnt.
4. **Unbekanntes Schreiben wirft.** `domina.titel = 'x'` legt keine stille Eigenschaft an `document` an. Geschrieben wird nur, was `domina` kennt, oder eine vorhandene, beschreibbare Eigenschaft von `document`.
5. **Gespiegelte Methoden verhalten sich bei nativen Argumenten exakt nativ.** Erweitert wird nur dort, wo der native Aufruf heute wirft oder Unsinn liefert (die Lückenregel aus [`prototype-hc`](../prototype-hc/concept.md#32-die-regel-nur-lücken-füllen)). Wer `document.` durch `domina.` ersetzt, ändert nichts, was vorher funktioniert hat.
6. **Kein Prototyp wird verändert.** Weder `Document` noch `Element` noch sonst etwas. Das Paket ist damit auch in Bibliotheken erlaubt.

---

## 2. Die Ebenen

```
domina(spec)                     -> 3. a chain
domina.querySelector(…)          -> 4. document's methods, mirrored, gaps filled
domina.get / getList / on / …    -> 5. short forms of 4
domina.title / vars / data / …   -> 6. document state as properties
domina.ready / visible / online  -> 7. environment and lifecycle
domina.set({ … }) / snapshot()   -> 8. many values at once
domina.watch('data.theme', fn)   -> 9. observing state
domina.within(root)              -> 10. the same facade for a subtree or shadow root
domina.extend / domina.space     -> 11. own members and namespaces
```

---

## 3. Aufruf: `domina()`

```js
domina('.card')            // d('.card'), a chain
domina('li', list)         // with a context
domina.all('.card')        // dd('.card'), getters for every element
```

`domina` ist aufrufbar, weil das Ziel des Proxys eine Funktion ist. Der Aufruf ist `d()` aus `@domina/chain`. Damit ist `domina` der eine Import einer App: Dokument, Zustand und Mengen.

Offen: `@domina/chain` fest einbinden oder nur, wenn es geladen ist (siehe [15](#15-offene-fragen)).

---

## 4. Gespiegelte Methoden von `document`

Die Methoden von `document`, die jeder benutzt, mit gefüllten Lücken. Native Argumente verhalten sich nativ.

```js
// querying: a spec object fills the gap (natively a SyntaxError)
domina.querySelector('#app')                                  // native
domina.querySelector({ tag: 'nav', ariaCurrent: 'page' })     // nav[aria-current="page"]
domina.querySelectorAll('li')                                 // NodeList, native
domina.getElementById('sidebar')                              // native

// creating: props and children fill the gap ({ is } and strings stay native)
domina.createElement('button', { class: 'primary', onClick: save }, 'Speichern')

// events: delegation and several types fill gaps, a disposer is returned (natively undefined)
const stop = domina.addEventListener('click', '[data-action]', handler);
domina.addEventListener('keydown keyup', handler, { passive: true });
domina.removeEventListener('click');                          // every listener for click added through domina
```

| Methode | Lücke | Stufe |
|---|---|---|
| `querySelector(spec)`, `querySelectorAll(spec)` | Objekt wird zu `'[object Object]'` → `SyntaxError` | sicher |
| `createElement(tag, props, ...children)` | Props-Objekt wird als Options-Dictionary ignoriert | weich |
| `addEventListener(type, selector, handler)` | Zweites Argument ist kein Listener → `TypeError` | sicher |
| `addEventListener(…)` → Disposer | Rückgabe `undefined` | weich |
| `addEventListener('a b', …)` | ein Typ mit Leerzeichen | weich |
| `removeEventListener(type)` ohne Handler | `TypeError: 2 arguments required` | sicher |

`querySelectorAll` bleibt bewusst eine `NodeList`: Sie in ein Array zu verwandeln, wäre ein harter Eingriff. Das Array gibt es über die Kurzform `getList`.

---

## 5. Kurzformen

Kurze Namen für die häufigsten Aufrufe aus 4, mit den freundlicheren Rückgaben:

```js
domina.get('#app')                     // querySelector, spec allowed, null if none
domina.getList('li')                   // an Array, not a NodeList
domina.getList('li', list)             // within a context
domina.create('li', { text: 'x' })     // createElement with props
domina.html`<li>${name}</li>`          // a fragment, values escaped

domina.on('keydown', handler)          // document level, returns the disposer
domina.on('click', '.btn', handler)    // delegated across the document
domina.once('pointerdown', handler)
domina.off('click')                    // what domina added for click
domina.emit('app:ready', { at })       // a CustomEvent on document
```

`domina.on` ist der stärkste Teil: Delegation über das ganze Dokument ist die häufigste Art, auf Ereignisse zu reagieren, und braucht nativ eine Handvoll Zeilen.

---

## 6. Dokumentzustand

Was eine App über das Dokument liest und schreibt, ist heute auf viele APIs verteilt (`document.title`, `documentElement.lang`, `style.setProperty`, `dataset`, `<meta>`-Elemente, `scrollTo`). In `domina` sind es Eigenschaften. Jeder Bereich unterstützt Lesen, Schreiben, `delete`, `in` und `Object.keys()`.

### Einfache Werte

```js
domina.title = 'Inbox (3)';           // document.title
domina.lang  = 'de';                  // <html lang>
domina.dir   = 'rtl';                 // <html dir>
domina.scheme = 'dark';               // <meta name="color-scheme"> and :root color-scheme
```

### `vars`: Custom Properties auf `:root`

```js
domina.vars.accent = 'tomato';        // --accent: tomato (the -- is optional)
domina.vars.accent                    // the computed value
domina.vars.gap = 8;                  // '8', custom properties take no units
delete domina.vars.accent
Object.keys(domina.vars)              // the inline custom properties of :root
```

### `data`: `data-*` auf `<html>`

```js
domina.data.theme = 'dark';           // <html data-theme="dark">
domina.data.theme                     // 'dark', a string
'theme' in domina.data
domina.data.compact = true;           // data-compact=""
domina.data.compact = false;          // removed
```

### `attr` und `class`: `<html>` selbst

```js
domina.attr.inert = true;
domina.class.reduced = matchMedia('(prefers-reduced-motion)').matches;   // toggles the class
domina.class                          // ['reduced', …]
```

### `meta`

```js
domina.meta.description = '…';        // <meta name="description">, created if missing
domina.meta['og:image'] = '/cover.png'; // property="og:image" for og: and article:
domina.meta['theme-color']
delete domina.meta.robots
```

### `id` und `forms`

```js
domina.id.sidebar                     // getElementById, null if none
domina.forms.login                    // the form named login (native document.forms)
domina.values.login                   // its values as an object (getFormValues)
domina.values.login = { user: 'ada' }; // fills it (setFormValues)
```

`domina.id` liest nur. `values` ist der einzige Bereich, der ein Element über seinen Namen findet und dessen Inhalt liest oder schreibt.

### `scroll` und `focus`

```js
domina.scroll // { x, y }
domina.scroll = { y: 0 }; // instant
domina.scroll = { y: 0, smooth: true };
domina.focus // document.activeElement, through shadow roots to the innermost
domina.focus = '#search'; // focuses, a selector or an element
```

---

## 7. Umgebung und Lebenszyklus

```js
await domina.ready      // DOMContentLoaded, or now
await domina.loaded     // load
await domina.fontsReady // document.fonts.ready
domina.visible          // visibilityState === 'visible'
domina.focused          // document.hasFocus()
domina.online           // navigator.onLine
domina.motion           // false when prefers-reduced-motion
domina.url              // a URL of location, read only
```

Zustände, die sich ändern (`visible`, `focused`, `online`, `motion`), lassen sich mit `watch` beobachten ([9](#9-beobachten)).

---

## 8. Mehrere Werte auf einmal

```js
domina.set({
  title : 'Inbox (3)',
  lang  : 'de',
  vars  : { accent: 'tomato', gap: 8 },
  data  : { theme: 'dark' },
  meta  : { description: '…' },
});

domina.snapshot()   // { title, lang, dir, vars, data, meta, scroll, … } as a plain object
```

`set` ist dieselbe Form wie der Zustand selbst. `snapshot()` macht `console.log` lesbar (ein Proxy zeigt sonst nur sich selbst) und ist zugleich das, was man speichern oder vergleichen kann. `toJSON` ist `snapshot`.

---

## 9. Beobachten

```js
const stop = domina.watch('data.theme', (value, old) => …);
domina.watch('title', …);
domina.watch('vars.accent', …); // inline changes on :root
domina.watch('visible', …);
domina.watch('online', …);
```

Pfade sind die Namen aus 6 und 7. Darunter arbeitet je nach Pfad ein `MutationObserver` auf dem Host bzw. `<head>` (`attributeFilter`, nur was beobachtet wird) oder das passende Ereignis (`visibilitychange`, `online`/`offline`, `change` einer Media Query). Der Callback läuft nur, wenn sich der Wert wirklich geändert hat (Knoten nach Identität, alles andere nach JSON-Form).

Das ist die Brücke zu Stores und Signals: Ein Theme-Store schreibt in `domina.data`, eine andere Stelle beobachtet `data.theme`, ohne dass beide voneinander wissen.

---

## 10. Bereiche: `domina.within()`

Dieselbe Fassade für einen Teilbaum oder eine Shadow Root:

```js
const card = domina.within('#card');
card.get('.title')                    // searched in #card
card.on('click', 'button', handler)   // delegated on #card
card.vars.accent = 'red';             // --accent on #card instead of :root
card.data.state  = 'open';            // data-state on #card

const shadow = domina.within(host.shadowRoot);
shadow.getList('slot')
```

Was sich auf das Dokument als Ganzes bezieht (`title`, `meta`, `ready`, `url`), gibt es in einem Bereich nicht. `within` gibt einen Proxy desselben Bauplans zurück, nur mit anderer Wurzel.

---

## 11. Erweitern

Wie bei `@domina/chain` sind Mitglieder Daten:

```js
// a member: a value with get / set, or a function
domina.extend({
  theme: {
    get : () => domina.data.theme ?? 'auto',
    set : value => domina.set({ data: { theme: value }, scheme: value === 'auto' ? 'light dark' : value }),
  },
  print: () => window.print(),
});

domina.theme = 'dark';

// a namespace: get / set / delete / keys, like vars or data
domina.space('tokens', {
  get    : name        => getComputedStyle(document.documentElement).getPropertyValue(`--t-${name}`).trim() || null,
  set    : (name, val) => document.documentElement.style.setProperty(`--t-${name}`, val),
  delete : name        => document.documentElement.style.removeProperty(`--t-${name}`),
  keys   : ()          => [...document.documentElement.style].filter(p => p.startsWith('--t-')).map(p => p.slice(4)),
});

domina.tokens.radius = '6px';
```

- Ein Name, den `domina` oder `document` schon hat, wirft.
- `domina.api` ist das Register aller Mitglieder und Bereiche, aus dem Doku, Typen und ein Playground (`www/proxy.html`) ableitbar sind, wie bei der Kette.
- Die eingebauten Bereiche aus 6 sind mit genau diesem `space()` gebaut.

---

## 12. Aufbau im Code

```
packages/proxy/
  facade.js       the proxy, the registry, createFacade(root)
  members.js      state and environment as values
  mirror.js       the mirrored methods of document with their gaps (4) and the short forms (5)
  space.js        space(definition, ctx) -> a proxy with get, set, deleteProperty, has, ownKeys
  spaces.js       vars, data, attr, class, meta, id, forms, values
  watch.js        paths -> observers and events
  index.js        wiring: set, snapshot, watch, within, extend, space
  index.d.ts
```

### Der Wurzel-Proxy

```js
const members = new Map;   // name -> { get, set } | function
const bound   = new Map;   // document methods, bound once, so domina.x === domina.x

const target = () => {};   // an arrow function: callable, no prototype, no invariant trouble

export const domina = new Proxy(target, {
  apply : (_, __, args) => d(...args),

  get (_, key) {
    if (typeof key === 'symbol') return undefined;
    const member = members.get(key);
    if (member) return typeof member === 'function' ? member : member.get();

    const value = document[key];
    if (typeof value !== 'function') return value;
    if (!bound.has(key)) bound.set(key, value.bind(document));
    return bound.get(key);
  },

  set (_, key, value) {
    const member = members.get(key);
    if (member?.set) { member.set(value); return true; }
    if (isWritable(document, key)) { document[key] = value; return true; }
    throw new TypeError(`[domina] "${String(key)}" is not writable`);
  },

  has     : (_, key) => members.has(key) || key in document,
  ownKeys : ()       => [...members.keys()],   // fine: an arrow function has no non-configurable own keys
});
```

- **Gebundene Funktionen werden gecacht**, sonst wäre `domina.querySelector !== domina.querySelector`, und `removeEventListener` mit einer gemerkten Referenz würde scheitern.
- **Das Ziel ist eine Pfeilfunktion.** Ein Proxy um `document` könnte nicht aufgerufen werden, und eine normale Funktion hätte ein nicht konfigurierbares `prototype`, das `ownKeys` immer melden müsste.
- **`isWritable`** prüft die Eigenschaft entlang der Prototypkette (Setter oder `writable`), wie `@domina/prototypes` es in `update` schon tut.

### Ein Bereich

```js
export function space ({ get, set, delete: remove, keys = () => [] }) {
  return new Proxy(Object.create(null), {
    get            : (_, key)        => typeof key === 'symbol' ? undefined : get(key),
    set            : (_, key, value) => { set(key, value); return true; },
    deleteProperty : (_, key)        => { remove?.(key); return true; },
    has            : (_, key)        => get(key) != null,
    ownKeys        : ()              => keys(),
    getOwnPropertyDescriptor : (_, key) => {
      const value = get(key);
      return value == null ? undefined : { configurable: true, enumerable: true, value };
    },
  });
}
```

Das ist im Kern `proxyOf` aus `@bunker/core`. Die Bereiche entstehen einmal beim Laden, nicht pro Zugriff.

---

## 13. Kosten

- **Zugriffe:** jeder durch einen Trap, wenige bis einige zehn Nanosekunden, nicht inlinebar. Für Code auf App-Ebene bedeutungslos; in Schleifen über viele Elemente gehört `domina` nicht hinein (dafür die Methods oder ein einmal geholtes Element).
- **`vars` lesen** ruft `getComputedStyle`, das bei ausstehenden Style-Änderungen einen Style-Recalc erzwingt. Lesen nach Schreiben in derselben Schleife ist teuer, wie überall im DOM.
- **Größe:** Der Kern (Proxy, `space`, Spiegelung) ist klein. `watch` nutzt `MutationObserver` direkt, ohne `@domina/observer`.
- **Ohne DOM** (Server, Worker): `domina` lässt sich importieren, jeder Zugriff wirft eine klare Meldung.
- **Typen:** Mitglieder und Bereiche exakt. `domina.id.*`, `domina.vars.*`, `domina.data.*` als `Record<string, …>`, mit einem Generic für eigene Schlüssel (`Domina<{ vars: 'accent' | 'gap'; data: 'theme' }>`). Unbekannte Namen von `document` kommen über `Omit<Document, …>`.

---

## 14. Einordnung

| | Subjekt | gibt zurück | verändert Prototypen | in Bibliotheken |
|---|---|---|---|---|
| `@domina/verbs`      | Argument               | native Werte     | nein | ja |
| `@domina/element`      | ein Element (Wrapper)  | Wrapper          | nein | ja |
| `@domina/chain`        | eine Menge (Wrapper)   | Kette oder Werte | nein | ja |
| `@domina/proxy`        | das Dokument (Fassade) | native Werte     | nein | ja |
| `@domina/prototypes`    | jedes Element | native Werte | ergänzt | nein |
| `@domina/prototype-hc` | jedes Element | native Werte | erweitert native | nein |

`domina` ist die einzige Oberfläche, die native Werte zurückgibt **und** kein Prototyp anfasst. Der Preis: Sie arbeitet auf Dokumentebene (und mit `within` auf Bereichen), nicht auf jedem Element. Für die Arbeit am einzelnen Element bleibt `domina(el)`, also die Kette.

---

## 15. Offene Fragen

Zum Abhaken. „Gebaut:“ ist die Vorgabe, die gerade im Code steht.

### Umfang

- [ ] **`@domina/chain` als feste Abhängigkeit?** Gebaut: ja, `domina()` ist `d()`. Alternative: `@domina/proxy` ohne Aufruf, `@domina/proxy/full` mit Kette.
- [ ] **Gespiegelte Methoden (4) behalten?** Gebaut: ja. Ohne sie wäre `domina` kleiner, nur Kurzformen und Zustand.
- [ ] **Schwester für `window`** (`win.size`, `win.scroll`, `win.media['(width < 40rem)']`): eigener Export, Teil von `domina` oder gar nicht?
- [ ] **`visible`, `focused`, `online`, `motion`** gehören eigentlich zum Fenster. Gebaut: auf `domina`. Bleiben oder in die `window`-Schwester?
- [ ] **Playground** `www/proxy.html` analog zu `chain.html`, aus `domina.api` abgeleitet?

### Namen

- [ ] **`get` / `getList`:** so lassen, oder `getAll`, `find`/`findAll`, `one`/`many`?
- [ ] **`all`** verdeckt `document.all` (die alte `HTMLAllCollection`). In Ordnung?
- [ ] **`forms`** verdeckt `document.forms` (jetzt ein Bereich nach Namen statt `HTMLCollection`; das Original über `domina.document.forms`). In Ordnung?
- [ ] **`class`** als Bereichsname (in JS erlaubt: `domina.class.x`), oder `classes`?
- [ ] **`fontsReady`**, oder `fonts` als Bereich (`domina.fonts.ready`, `domina.fonts.loaded('Inter')`)? Achtung: `fonts` ist heute `document.fonts`.

### Verhalten

- [ ] **`scheme`** setzt zwei Dinge (`<meta name="color-scheme">` und `color-scheme` auf `:root`). Gebaut: ein Mitglied für beides.
- [ ] **`vars` lesen:** Gebaut: berechneter Wert; `Object.keys(domina.vars)` zählt nur die Inline-Werte auf. Asymmetrie dokumentieren oder auflösen (`vars` inline, `tokens` berechnet)?
- [ ] **`data` castet nicht** (Strings rein, Strings raus), `getData` in `@domina/verbs` castet (`autoCast`). Methods angleichen?
- [ ] **`focus` als Setter**, der fokussiert. Gebaut: ja. Alternative: nur lesend plus `focusOn(spec)`.
- [ ] **`set()`** gibt die Fassade zurück. Oder nichts?
- [ ] **`within()`:** Mitglieder nur fürs Dokument (`title`, `meta` …) fallen dort auf das Element durch, lesend und schreibend (`card.title` ist das `title`-Attribut des Elements). Stattdessen werfen?
- [ ] **`html('<b>x</b>')` mit einem String** wird als HTML genommen, ungeprüft. Nur Template-Literals zulassen?
- [ ] **`emit`:** gebaut `bubbles: true`, `cancelable: true`, `composed: false`. Für Shadow DOM `composed: true` als Default?
- [ ] **`watch('scroll')`** feuert pro `scroll`-Event. Mit `requestAnimationFrame` drosseln?

### In `@domina/verbs` gefunden

- [ ] **`buildSelector` macht Attributnamen nicht kebab-case:** `{ ariaCurrent: 'page' }` wird zu `[ariaCurrent="page"]`, das `aria-current` nie trifft (Attributnamen sind in HTML unabhängig von Groß-/Kleinschreibung, aber der Bindestrich fehlt). Bei `dataset` passiert es schon.
- [ ] **`getElement`/`getElements` werfen** bei einem ungültigen Selektor (`SyntaxError`), `d()` liefert eine leere Menge. Vereinheitlichen?
- [ ] **`emitEvent`** nimmt nur, was `resolveElement` kennt; mit einer Shadow Root als Ziel liefert es `false`. `domina.emit` nutzt deshalb `dispatchEvent` direkt.

---

# lol

Das haste ja echt toll "zum Abhaken" gebaut. Also, abhaken kann man es, aber was das dann.bedeuten soll bei den meisten Punkten wäre irgendwie komplett unklar, weil da gefühlt nix passend formuliert ist usw. 

Naja, jedenfalls:

Ich weiß nicht so ganz, was du hier veranstaltet hast, aber alles ist schief und krumm, nix ist konsequent, alles wirr.

Wozu braucht es denn `domina.on`, wenn `domina.addEventListener` (native like but extended) und `domina().on` (chain/short) vorhanden sind? Wären dann 3 Wege für's Selbe.

```js
// native with benefits
domina.addEventListener
// chain
domina().on
```

```js
// nativ with benefits
domina.querySelector
domina.querySelectorAll // returns NodeList
// domina
domina.select    // or get ?
domina.selectAll // or getAll ? returns Array
//
d
dd
```

## verhalten
```js
// auto-casting off
domina.dataset
// auto-casting on
domina.data
```
