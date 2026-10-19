# @domina/prototype-hc – Konzept und Einschätzung

Notiz zu der Frage: freie Funktionen (`@domina/methods`), additive Prototyp-Methoden (`@domina/prototypes`) oder die nativen Methoden selbst erweitern (`@domina/prototype-hc`). Noch kein Code.

---

## 1. Die Problematik

Die Beobachtung stimmt, und sie lässt sich genauer fassen: **Die Methods normalisieren den Eingang, aber nicht den Ausgang.**

```js
const sidebar = getElement({ name: 'nav', class: 'panel' });   // any shape in
sidebar.querySelectorAll('a')                                   // a raw element out, back to native
  .forEach(a => a.addEventListener('click', open));
```

`getElement` nimmt Selektor, Spec-Objekt, Element oder Wrapper. Zurück kommt ein rohes `Element`, und ab da gilt wieder die native API. Jeder weitere Schritt muss entweder wieder durch eine freie Funktion (`getChildren(getElement(…))`, von innen nach außen gelesen) oder fällt auf `querySelectorAll`/`addEventListener` zurück. Daraus entsteht der uneinheitliche Code: freundlich am Einstieg, nativ ab dem zweiten Schritt.

Daraus folgen zwei Dinge:

1. **Ein Teil der Methods existiert nur wegen der Form „freie Funktion“.** `getChildren`, `getNext`, `getParent`, `hasClass`, `getText`, `matchesElement` und ähnliche sind native Einzeiler, die nur deshalb da sind, weil man sonst den Stil wechseln müsste. An einer Oberfläche, die verkettet oder am Prototyp hängt, braucht es sie nicht.
2. **Der andere Teil ist echte Logik**, die keine Oberfläche ersetzt: `buildSelector` (Spec → Selektor), `updateElement` (Props, Kinder, Ref), `getFormValues`/`setFormValues`, `setStyle` (Einheiten), `delegateEvent`, `getValue` mit Casts, Fonts, Meta, Stylesheets.

Das legt eine Rollenverteilung nahe, die zum Toolkit-Gedanken passt:

```
@domina/methods      the engine: logic, input normalization, null safety. no user-facing ideal
 ├── @domina/element      surface: wrapper, explicit names
 ├── @domina/chain        surface: sets, short verbs (d)
 ├── @domina/prototypes    surface: additive methods on the dom
 ├── @domina/prototype-hc surface: the native methods themselves, enhanced
 └── @domina/proxy        surface: the document as a namespace
```

Die Methods müssen dann nicht mehr selbst angenehm zu benutzen sein. Sie sind die eine Stelle, an der die Logik lebt, und jede Oberfläche ruft sie auf. Die reinen Einzeiler-Methods können bleiben (für Leute, die freie Funktionen mögen), sind aber nicht mehr der Grund für die anderen Pakete.

Was die native API heute schon gut macht und wofür es **keine** eigene Methode mehr braucht: `closest`, `matches`, `toggleAttribute`, `classList.toggle(name, force)`, `replaceChildren`, `append` mit Strings, `before`/`after`/`replaceWith`, `addEventListener` mit `{ signal, once }`, `NodeList.forEach`, `:has()`, `checkVisibility()`, `scrollIntoView({ block })`.

Was die native API nach wie vor schlecht macht, und wo jede Oberfläche ansetzen sollte:

| Lücke | nativ |
|---|---|
| Mehrere Werte setzen | ein `setAttribute`/`setProperty` pro Wert |
| Listen sind keine Arrays | `querySelectorAll` → `NodeList` ohne `map`/`filter` |
| Abmelden | Handler-Referenz aufheben oder `AbortController` anlegen |
| Delegation | von Hand mit `closest` und `contains` |
| Einheiten | `style.width = 10` wird ignoriert |
| Daten | `dataset` nur Strings |
| Elemente mit Props bauen | `createElement` plus N Zuweisungen |
| Specs statt Selektor-Strings | Selektoren von Hand zusammensetzen und escapen |

---

## 2. `@domina/prototypes`

Der Ansatz ist gut, weil er das Ausgangsproblem tatsächlich löst: Was zurückkommt, ist ein natives Element, und es hat die Methoden schon. Kein Wrapper, keine Identitätsfragen, jede Fremdbibliothek bekommt dasselbe Objekt.

Drei Punkte, auf die ich achten würde:

### 2.1 Die Namensregel `get…`/`set…` ist genau die der Plattform

WHATWG benennt neue Methoden selbst so: `getAttributeNames`, `getAnimations`, `getHTML`, `setHTMLUnsafe`, `setPointerCapture`, `getBoxQuads`, und `setHTML` kommt mit der Sanitizer API. `@domina/prototypes` hat `getElement`, `getElements`, `setAttributes`, `setProperties`, `getValues`, `setValues`. Jeder davon ist ein plausibler Kandidat für einen künftigen nativen Namen. Wenn das passiert, überschreibt `@domina/prototypes` ihn heute mit einer Warnung, also mit eigener Semantik für alle Skripte der Seite.

Das ist kein theoretisches Risiko: MooTools hat `Array.prototype.flatten` definiert, deshalb heißt die native Methode heute `flat` („smooshgate“), und `Array.prototype.contains` wurde aus demselben Grund zu `includes`. Umgekehrt hat das `wrap`-Problem aus `TODO.md` (`HTMLTextAreaElement.prototype.wrap`) dieselbe Ursache.

**Vorschlag:**
- **Nie überschreiben, nur ergänzen.** Existiert der Name, bleibt der native, und die domina-Methode wird nicht installiert (mit Warnung). Wer sie trotzdem will, ruft sie als Funktion auf. Damit kann die Plattform später nichts kaputt machen; sie gewinnt einfach.
- **Ein Prüfschritt im Build:** eine Liste aller Namen gegen die aktuellen Prototypen von Chromium, Firefox und WebKit (das, was `TODO.md` für `wrap` von Hand gemacht hat), als Skript.

### 2.2 `createElement` ist schon eine hc-Methode

`Document.prototype.createElement` wird ersetzt, nicht ergänzt. Das zweite Argument war nativ schon ein Objekt (`{ is }`), jetzt ist es ein Props-Objekt. Das ist sorgfältig gemacht (`{ is }` und Strings verhalten sich wie vorher), aber es ist genau das Prinzip von `prototype-hc`. Entweder gehört es dorthin, oder `prototype` sagt offen: „eine Ausnahme, die native Signatur bleibt gültig“. Mit der Regel aus 3.2 wäre es ein „weicher“ Eingriff.

### 2.3 Realm und Bibliotheken

Richtig im README: Eine Bibliothek darf das nicht importieren. Zwei Dinge fehlen dort noch:
- **iframes und Fenster** haben eigene Prototypen. Ein Element aus `iframe.contentDocument` hat die Methoden nicht, bis das Paket im iframe auch läuft. Ein `install(window)` für fremde Realms wäre die Lösung.
- **Laden:** Alles wird beim Import installiert, Tree Shaking ist ausgeschlossen. Untergruppen als eigene Importe (`@domina/prototypes/query`, `/events`, `/aria`) würden das lösen und zugleich das Risiko aus 2.1 eingrenzen.

Performance ist kein Thema: Methoden an `Element.prototype` hinzuzufügen kostet einmal beim Start (die Engine verwirft ein paar Caches), danach nichts. Problematisch wäre nur `Object.prototype`, und das fasst domina nicht an.

---

## 3. `@domina/prototype-hc`

Die Idee: Statt neuer Namen werden die nativen Methoden selbst erweitert. `querySelector` nimmt eine Spec, `addEventListener` gibt einen Disposer zurück und kann delegieren, `setAttribute` nimmt eine Map. Man lernt keine neuen Namen, MDN bleibt die Referenz, und der Code sieht aus wie normales DOM.

Ich halte das für ein lohnendes Experiment: lehrreich, und es zwingt dazu, die Lücken der Plattform genau zu kennen. Damit es nicht kippt, braucht es eine harte Regel.

### 3.1 Was dagegen spricht, ehrlich

- **Der Code lügt über seine Herkunft.** `el.setAttribute({ id: 'a' })` sieht nativ aus und ist es nicht. Wer den Code liest oder kopiert, ohne das Paket zu kennen, bekommt einen Fehler, der nicht zum Code passt.
- **Alle Skripte im Realm** rufen die erweiterten Methoden auf: Bibliotheken, Analytics, Browser-Erweiterungen. Jede Abweichung trifft auch sie.
- **Heiße Pfade.** `querySelector` und `addEventListener` werden von Frameworks tausendfach aufgerufen. Jede Erweiterung liegt als JS-Funktion vor der nativen und kostet einen Sprung und eine Typprüfung.
- **Die Plattform füllt Lücken selbst.** Was heute wirft, kann morgen eine native Bedeutung haben.
- **`Function.prototype.toString`** zeigt keinen `[native code]` mehr. Manche Seiten (Bot-Erkennung, Anti-Tampering) prüfen genau das. Eher eine Kuriosität, aber real.

### 3.2 Die Regel: nur Lücken füllen

Jede Erweiterung wird nach dem eingestuft, was der native Aufruf **heute** mit dem neuen Argument tut:

| Stufe | heute nativ | erlaubt |
|---|---|---|
| **sicher** | wirft (`TypeError`, `SyntaxError`, „2 arguments required“) | ja: kein funktionierender Code kann davon abhängen |
| **weich** | tut etwas Sinnloses (`'[object Object]'`, wird ignoriert) | ja, dokumentiert |
| **hart** | tut etwas Sinnvolles, das sich ändern würde | nein, dafür ist `@domina/prototypes` da |

Damit verhält sich jeder Code, der heute korrekt läuft, genauso wie vorher. Die Erweiterung lebt ausschließlich dort, wo der native Aufruf heute versagt.

### 3.3 Kandidaten, eingestuft

| Erweiterung | heute nativ | Stufe |
|---|---|---|
| `setAttribute({ id: 'a', hidden: true })` | `TypeError: 2 arguments required` | sicher |
| `setAttribute('hidden', true/false)` | `'true'`/`'false'` als String | **hart** (`aria-*` braucht genau das) |
| `querySelector({ tag: 'li', class: 'row' })` | `'[object Object]'` → `SyntaxError` | sicher |
| `querySelectorAll({ … })` | dasselbe | sicher |
| `closest({ … })`, `matches({ … })` | dasselbe | sicher |
| `addEventListener('click', 'li', handler)` (Delegation) | `TypeError`: zweites Argument ist kein Listener | sicher |
| `addEventListener(…)` gibt einen Disposer zurück | gibt `undefined` zurück | weich (niemand liest den Rückgabewert) |
| `addEventListener('click keydown', …)` | registriert einen Typ mit Leerzeichen | weich (gültig, aber praktisch nie benutzt) |
| `removeEventListener('click')` ohne Handler: alle entfernen | `TypeError: 2 arguments required` | sicher |
| `classList.add('a b')` | `InvalidCharacterError` | sicher |
| `classList.toggle({ a: true, b: false })` | `'[object Object]'` → wirft | sicher |
| `style.setProperty('width', 10)` → `10px` | `'10'`, ungültig, ignoriert | weich |
| `dataset.config = { … }` → JSON | `'[object Object]'` | weich |
| `append({ tag: 'li', text: 'x' })` | `'[object Object]'` als Text | weich |
| `querySelectorAll()` liefert ein Array | `NodeList` (`item()`, `instanceof`) | **hart** |
| `NodeList.prototype.map/filter/on` ergänzen | existiert nicht | additiv, gehört zu `prototype` |

Die Tabelle zeigt auch die Grenze: Die nützlichsten Wünsche (`querySelectorAll` als Array, Boolean-Attribute) sind hart. Dafür bleibt `prototype` die richtige Stelle (`NodeList.prototype.map`, `setAttributes`).

### 3.4 Selbstprüfung beim Installieren

Weil die Plattform Lücken schließen kann, prüft das Paket beim Installieren jede Lücke, bevor es sie füllt:

```js
// a gap is filled only while the native call still fails
const gaps = {
  setAttributeMap : () => throws(() => document.createElement('i').setAttribute({ a: 1 })),
  delegation      : () => throws(() => new EventTarget().addEventListener('x', 'li', () => {})),
  classListSpaces : () => throws(() => document.createElement('i').classList.add('a b')),
};

for (const [name, stillOpen] of Object.entries(gaps)) {
  if (stillOpen()) install(name);
  else console.warn(`[@domina/prototype-hc] the platform fills "${name}" itself now, left alone`);
}
```

So kann eine neue Browserversion das Paket nicht unbemerkt brechen. Sie schaltet einzelne Erweiterungen ab und sagt es.

### 3.5 Form der Erweiterung

```js
const native = Element.prototype.setAttribute;

Element.prototype.setAttribute = function setAttribute (name, value) {
  if (typeof name === 'string') return native.call(this, name, value);   // the native path first, one check
  for (const [key, item] of Object.entries(name)) {
    if (item === false || item == null) this.removeAttribute(toKebabCase(key));
    else native.call(this, toKebabCase(key), item === true ? '' : item);
  }
};
```

- **Der native Pfad zuerst**, mit genau einer Typprüfung. Für alle Aufrufe, die heute funktionieren, kostet die Erweiterung einen Funktionssprung und ein `typeof`.
- **Name und `length` der Funktion** bleiben wie nativ (`setAttribute`, 2), damit Feature-Erkennung in Fremdcode nicht stolpert.
- **`uninstall()`** stellt alle Originale wieder her, für Tests und zum Vergleichen.
- **Gruppen einzeln:** `@domina/prototype-hc/query`, `/events`, `/attributes`, `/classes`, `/style`.
- **Typen** über Declaration Merging (`interface Element { setAttribute(map: Record<string, …>): void }`), die nativen Overloads bleiben stehen.

### 3.6 Einschätzung

| | `prototype` | `prototype-hc` |
|---|---|---|
| neue Namen lernen | ja | nein |
| Risiko durch künftige Plattform | Namenskollision (mit „nie überschreiben“ entschärft) | Lücke wird gefüllt (mit Selbstprüfung entschärft) |
| Wirkung auf Fremdcode | keine, solange nichts überschrieben wird | jede Erweiterung läuft für alle |
| Lesbarkeit ohne Kontext | sichtbar fremd (`el.setAttributes`) | sieht nativ aus, ist es nicht |
| Kosten auf heißen Pfaden | keine | ein Sprung und eine Prüfung pro Aufruf |
| Lehrwert | mittel | hoch: man lernt jede Lücke der Plattform genau kennen |

Mein Vorschlag: beides. `prototype` als die vernünftige Variante für Apps (mit „nie überschreiben“), `prototype-hc` als bewusst radikales Experiment mit der Lückenregel, der Selbstprüfung und `uninstall()`. Die Kandidatentabelle aus 3.3 ist zugleich eine Liste, was an der DOM-API eigentlich fehlt, und damit nützlich für alle anderen Oberflächen.
