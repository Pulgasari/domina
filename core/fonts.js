// fonts.js

document.fonts.ready              // -> Promise, alle laufenden Ladungen fertig
document.fonts.status             // 'loading' | 'loaded'
document.fonts.check('16px Foo')  // ist die font sofort verfügbar?
document.fonts.load('16px Foo')   // -> Promise<FontFace[]>, erzwingt laden
      // programmatisch registrieren
document.fonts.forEach(...)       // iterierbar, alle bekannten faces

const f = new FontFace(' });
await f.load();
document.fonts.add(f);

export const

addFont = (name, url, obj) face{
  const fontface = new Font (name, url, obj);
  document.fonts.add(fontface);
}, 
  
Foo', 'url(/foo.woff2)', { weight: '400', display: 'swap'});
