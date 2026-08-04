// @ts-self-types="./mod.d.ts"

// @domina/pipe — data-last, curried fassade über @domina/core.
// keine eigene logik: jeder export ist ein umgedrehtes core-verb.

import * as dom from '@domina/core';

//========================================================================
// KOMBINATOREN
//========================================================================

export const

// pipe(el, f, g) -> g(f(el))   wert direkt durchschieben
pipe = (value, ...fns) => fns.reduce((acc, fn) => fn(acc), value),

// flow(f, g) -> el => g(f(el))   wiederverwendbare komposition
flow = (...fns) => value => fns.reduce((acc, fn) => fn(acc), value),

// seiteneffekt einschieben, wert bleibt
tap = fn => value => (fn(value), value),

// nur ausführen wenn prädikat zutrifft
when = (test, fn) => value => test(value) ? fn(value) : value,

// null-safe: bricht die kette ab statt zu werfen
maybe = fn => value => value == null ? null : fn(value);

//========================================================================
// FLIP-HELFER — data-first -> data-last
//========================================================================

// optionale argumente machen generisches curry unzuverlässig,
// deshalb explizite arität statt magie.
const
f1 = fn =>          el => fn (el),
f2 = fn => a     => el => fn (el, a),
f3 = fn => (a,b) => el => fn (el, a, b);

//========================================================================
// VERBEN
//========================================================================

export const

// query
find     = f2(dom.getElement),      // find('.x')(container)
findAll  = f2(dom.getElements),
clone    = f2(dom.clone),

// attrs
attr        = f2(dom.getAttr),      // terminiert die kette
setAttr     = f3(dom.setAttr),
setAttrs    = f2(dom.setAttrs),
removeAttr  = f2(dom.removeAttr),
   hasAttr  = f2(dom.hasAttr),

// classes
   addClass = f2 (dom.addClass),
removeClass = f2 (dom.removeClass),
toggleClass = f3 (dom.toggleClass),
   hasClass = f2 (dom.hasClass),

// style
getStyle    = f2(dom.getStyle),
setStyle    = f2(dom.setStyle),

// values
getValue    = f2(dom.getValue),
setValue    = f3(dom.setValue),

// update
updateElement = f2(dom.updateElement),

// misc
wrap        = f3(dom.wrap),
moveTo      = f3(dom.moveTo),
remove      = f1(dom.remove),

// events — gibt disposer zurück, terminiert
on          = fn => (types, handler, options) => el => dom.on(el, types, handler, options);

