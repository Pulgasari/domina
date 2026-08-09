// core/namespaces/meta.js
import { getMeta, setMeta, removeMeta, hasMeta } from '../meta.js';

const ensureNoColon =  prefix        => prefix.endsWith(':') ? prefix.slice(0,-1) : prefix;
const withColon     = (prefix, prop) => prefix.endsWith(':') ? `${prefix}${prop}` : `${prefix}:${prop}`;    

const _getMeta = key => getMeta(ensureNoColon(key));

const createMetaProxy = (prefix = '') => {
  const dummyTarget = Object.create(null);

  return new Proxy(dummyTarget, {
    get (target, prop) {
      // Ignoriere interne Symbole (außer Konvertierung)
      if (typeof prop === 'symbol') {
        return (prop === Symbol.toPrimitive)
          ? () => _getMeta(prefix) ?? ''
          : undefined;
      }

      // Core-API-Methoden auf Root-Ebene bereitstellen
      if (prefix === '') switch (prop) {
        case 'get'    : return getMeta;
        case 'set'    : return setMeta;
        case 'has'    : return hasMeta;
        case 'remove' : return removeMeta;
      }
      /*
      return = (prop) => match({
        [or('toString', 'valueOf')] : () => _getMeta(key) ?? '';
        toJSON                      : () => _getMeta(key);
        [or('catch', 'then']        : undefined
      }, () => 'unbekannt');

      switch (prop) {
        case 'toString' : return () => _getMeta(key) ?? '';
        case 'valueOf'  : return () => _getMeta(key) ?? '';
        case 'toJSON'   : return () => _getMeta(key);
        case 'catch'    : return undefined;
        case 'then'     : return undefined;
      }
      */
      
      // Konvertierungsmethoden für direkte String-Auswertung
      if (prop === 'toString') return () => _getMeta(key) ?? '';
      if (prop === 'valueOf')  return () => _getMeta(key) ?? '';
      if (prop === 'toJSON')   return () => _getMeta(key);
      if (prop === 'catch')    return undefined;
      if (prop === 'then')     return undefined;
      /*
      const hmm = {
        toString : () => _getMeta(key) ?? '',
        valueOf  : () => _getMeta(key) ?? '',
        toJSON   : () => _getMeta(key),
        catch    : undefined,
        then     : undefined,
      }[prop]; if (hmm) return hmm;
      */

      // Nächste Namespace-Ebene berechnen
      // e.g. 'og' -> 'og:', oder wenn prop bereits ':' enthält ('og:image')
      const nextKey    = prefix ? withColon(prefix, prop) : prop;
      const nextPrefix = nextKey.includes(':') ? nextKey : `${nextKey}:`;

      return createMetaProxy(nextPrefix);
    },

    set (target, prop, value) {
      if (typeof prop !== 'string') return false;
      const fullKey = prefix ? withColon(prefix, prop) : prop;
      setMeta(fullKey, value);
      return true;
    },

    deleteProperty (target, prop) {
      if (typeof prop !== 'string') return false;
      const fullKey = prefix  ? withColon(prefix, prop) : prop;
      removeMeta(fullKey);
      return true;
    }
  });
};

export const meta = createMetaProxy();
