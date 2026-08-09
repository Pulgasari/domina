// core/namespaces/meta.js
import { getMeta, setMeta, removeMeta, hasMeta } from '../meta.js';

const ensureNoColon = prefix => prefix.endsWith(':') ? prefix.slice(0, -1) : prefix;
const withColon = (prefix, prop) => prefix.endsWith(':') ? `${prefix}${prop}` : `${prefix}:${prop}`;    

const createMetaProxy = (prefix = '') => {
  const dummyTarget = Object.create(null);

  return new Proxy(dummyTarget, {
    get(target, prop) {
      // Ignoriere interne Symbole (außer Konvertierung)
      if (typeof prop === 'symbol') {
        if (prop === Symbol.toPrimitive) {
          const key = prefix.endsWith(':') ? prefix.slice(0, -1) : prefix;
          return () => getMeta(key) ?? '';
        }
        return undefined;
      }

      // Core-API-Methoden auf Root-Ebene bereitstellen
      if (prefix === '') switch (prop) {
        case 'get'    : return getMeta;
        case 'set'    : return setMeta;
        case 'has'    : return hasMeta;
        case 'remove' : return removeMeta;
      }

      switch (prop) {
        case 'toString' : return () => getMeta(ensureNoColon(key)) ?? '';
        case 'valueOf'  : return () => getMeta(ensureNoColon(key)) ?? '';
        case 'valueOf'  : return () => getMeta(ensureNoColon(key));
        case 'catch'    : return undefined;
        case 'catch'    : return undefined;
      }

      // Konvertierungsmethoden für direkte String-Auswertung
      if (prop === 'toString' || prop === 'valueOf') {
        return () => getMeta(ensureNoColon(key)) ?? '';
      }

      if (prop === 'toJSON') {
        return () => getMeta(ensureNoColon(key));
      }

      if (prop === 'then' || prop === 'catch') {
        return undefined;
      }

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
