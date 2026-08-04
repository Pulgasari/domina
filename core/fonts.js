// fonts.js

document.fonts.ready              // -> Promise, alle laufenden Ladungen fertig
document.fonts.status             // 'loading' | 'loaded'


export const

addFont = (name, url, obj) {
  const fontface = new Font (name, url, obj);
  document.fonts.add(fontface);
},

hasFont  = check => document.fonts.check(check),
eachFont = fn    => document.fonts.forEach(fn),

loadFont = async check => document.fonts.load(check),
  
Foo', 'url(/foo.woff2)', { weight: '400', display: 'swap'});
