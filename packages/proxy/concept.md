# @domina/proxy – Konzept und Einschätzung

Die Idee: ein `Proxy` um `document`, referenziert als `domina`. Noch kein Code.

---

## 1. Geht das?

Ja, aber nicht als echter Ersatz für `document`. Zwei Eigenschaften von Proxies um Host-Objekte entscheiden das:

**1. Native Methoden prüfen ihren Empfänger.** `domina.querySelector('a')` ruft `Document.prototype.querySelector` mit `this === domina` auf, also mit dem Proxy, nicht mit dem Dokument. Ergebnis: `TypeError: Illegal invocation`. Lösbar: Der `get`-Trap gibt Funktionen an das echte `document` gebunden zurück (wie `BunkerDB` es für seine Tabellen macht).

**2. Proxies bestehen keine Brand Checks.** Überall, wo eine native API ein `Document` oder einen `Node` als **Argument** erwartet, wird der Proxy abgelehnt:

```js
new MutationObserver(fn).observe(domina, { childList: true });   // TypeError: not of type 'Node'
document.adoptNode(…); range.selectNodeContents(domina);         // dasselbe
domina === document                                              // false
event.currentTarget === domina                                   // false: events see the real document
```

Diese Fälle kann der Proxy nicht abfangen, weil die native Funktion ihn als Argument bekommt, nicht als Empfänger. Daraus folgt eine harte Grenze für jeden tieferen Ansatz: **Elemente, die der Proxy zurückgibt, dürfen keine Proxies sein.** Ein Element-Proxy würde bei `parent.append(el)`, `observer.observe(el)`, `range.setStart(el, 0)` und als Schlüssel in `WeakMap`s scheitern. Ein „Proxy bis ganz unten“ ist damit ausgeschlossen.

**Was übrig bleibt, ist trotzdem gut:** `domina` als **Fassade für das Dokument**. Ein Namespace, der wie `document` aussieht und alles Native durchreicht, aber zusätzlich Zustand auf Dokumentebene als Eigenschaften anbietet. Er gibt immer echte Elemente zurück und wird nie dort übergeben, wo die Plattform ein `Document` erwartet (dafür gibt es `domina.document`).

---

## 2. Form

### 2.1 Aufrufbar und mit Eigenschaften

Ein Proxy ist nur aufrufbar, wenn sein Ziel eine Funktion ist. Das Ziel ist deshalb nicht `document`, sondern eine Pfeilfunktion (sie hat kein `prototype`, das vermeidet Konflikte mit den Invarianten von `ownKeys`/`getOwnPropertyDescriptor`). Unbekannte Namen werden an `document` durchgereicht:

```js
import domina from '@domina/proxy';

domina('.card')                       // a chain (@domina/chain), or Element[] without it
domina.querySelector('#app')          // native, bound to document
domina.body  domina.head  domina.root
domina.document                       // the real one, for apis that need it
```

### 2.2 Dokumentzustand als Eigenschaften

Hier liegt der eigentliche Gewinn: Vieles, was eine App über das Dokument wissen oder ändern will, ist heute auf verschiedene APIs verteilt. Als Eigenschaften gelesen, geschrieben, gelöscht und aufgezählt:

```js
domina.title = 'Inbox (3)';
domina.lang  = 'de';
domina.dir   = 'rtl';

domina.vars.accent = 'tomato';        // :root { --accent: tomato }
domina.vars.accent                    // the computed value
delete domina.vars.accent

domina.data.theme = 'dark';           // <html data-theme="dark">
'theme' in domina.data
Object.keys(domina.data)

domina.meta.description = '…';        // <meta name="description">
domina.meta['og:image']  = '/cover.png';
domina.meta['theme-color']

domina.id.sidebar                     // getElementById, null when missing
domina.scroll = { y: 0 };             // window.scrollTo
domina.scroll                         // { x, y }
```

Jeder Unterbereich (`vars`, `data`, `meta`, `id`) ist ein eigener kleiner Proxy mit `get`, `set`, `deleteProperty`, `has` und `ownKeys`. Darunter arbeiten die Methods (`setCustomProperty`, `setData`, `setMeta`, `getElementById`, `setScroll`).

### 2.3 Ereignisse und Zustände

```js
const stop = domina.on('keydown', handler);   // document-level, returns the disposer
await domina.ready;                           // DOMContentLoaded or already done
await domina.loaded;                          // load
domina.visible                                // visibilityState === 'visible'
domina.focused                                // document.hasFocus()
domina.online                                 // navigator.onLine
```

### 2.4 Tippfehlerschutz

Ein Proxy, der unbekannte Schreibzugriffe an `document` durchreicht, legt bei `domina.titel = 'x'` still eine Expando-Eigenschaft an. Der `set`-Trap sollte deshalb nur bekannte Namen erlauben (eigene Bereiche plus vorhandene, beschreibbare Eigenschaften von `document`) und sonst werfen. Lesen darf großzügig sein, Schreiben nicht.

---

## 3. Kosten

- **Performance:** Jeder Zugriff geht durch einen Trap, das kostet wenige bis einige zehn Nanosekunden und ist nicht inlinebar. Für Code auf App-Ebene (Titel, Theme, Tokens) bedeutungslos, in Schleifen über tausende Elemente nicht. Dafür gibt es `d()` und die Methods.
- **Typen:** Bekannte Bereiche lassen sich exakt typisieren. Dynamische Schlüssel (`domina.id.*`, `domina.vars.*`) nur als `Record<string, …>`. Ein Generic für die eigenen Tokens (`Domina<{ vars: 'accent' | 'gap' }>`) wäre möglich.
- **Debugging:** `console.log(domina)` zeigt einen Proxy um eine Funktion, nicht das Dokument. Ein `toJSON()` oder `inspect()`, das den Zustand (Titel, Sprache, Vars, Data, Meta) als Objekt liefert, macht das lesbar.
- **Ohne DOM** (Server, Worker): `domina` existiert, jeder Zugriff wirft eine klare Meldung statt `document is not defined`.

---

## 4. Einschätzung

| | |
|---|---|
| Proxy als vollständiger Ersatz für `document` | nein: Brand Checks und Identität |
| Proxies für zurückgegebene Elemente | nein: jede native API, die einen `Node` nimmt, lehnt sie ab |
| Fassade mit durchgereichten nativen Methoden | ja |
| Dokumentzustand als Eigenschaften (`title`, `lang`, `vars`, `data`, `meta`, `id`, `scroll`) | ja, und das ist der eigentliche Gewinn |
| aufrufbar als `domina('.x')` | ja, mit einer Funktion als Ziel |

Ich würde das Paket als „das Dokument als Zustandsobjekt“ bauen, nicht als „Proxy um `document`“. Der Proxy ist dabei Mittel, nicht Zweck. Interessant wird es im Zusammenspiel:

- **mit `@aufbau/store` oder Signals:** `domina.vars` und `domina.data` sind genau die Stellen, an die ein Theme-Store schreibt. Ein `domina.vars.bind(store, 'accent')` oder umgekehrt ein Store-`persist`, der `domina.data` ist, liegt nahe.
- **mit `@domina/chain`:** `domina(…)` ist dann einfach `d(…)`, und `domina` wird der eine Import für eine App: Dokument, Zustand und Mengen.
- **mit der zugriff-Middleware:** Die Gestalt (Palette, Dichte, Geometrie) landet dort als `data-*` und Custom Properties auf `<html>`; `domina.data`/`domina.vars` wäre die Client-Seite derselben Sache.
