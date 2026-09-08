// extractStylesheetImports.js

const COMMENT = /\/\*[\s\S]*?\*\//g;

// @import [ <url> | <string> ] layer|layer(…)? supports(…)? <media-query-list>? ;
// the url alternatives come first so a quoted url() never falls through to the bare form
const IMPORT = /@import\s+(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)|"([^"]*)"|'([^']*)')([^;]*);/g;

// reads a balanced (…) group starting at index -> [inner, endIndex] or null.
// a depth counter, because supports((display:grid) and (color)) nests
const readParens = (text, index) => {
  if (text[index] !== '(') return null;

  let depth = 0;
  for (let i = index; i < text.length; i++) {
         if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return [text.slice(index + 1, i), i + 1];
  }
  return null;
};

// everything after the url -> { layer, supports, media }. the spec fixes that order,
// so each part is peeled off the front in turn and whatever remains is the media query
const splitCondition = (tail) => {
  let rest     = tail.trim();
  let layer    = null;
  let supports = null;

  if (rest.startsWith('layer')) {
    rest = rest.slice(5);
    const group = readParens(rest, 0);
    if (group) { layer = group[0].trim(); rest = rest.slice(group[1]); }
    else         layer = ''; // the anonymous `layer` keyword
    rest = rest.trim();
  }

  if (rest.startsWith('supports')) {
    const group = readParens(rest, 8);
    if (group) { supports = group[0].trim(); rest = rest.slice(group[1]).trim(); }
  }

  return { layer, media: rest || null, supports };
};

const resolveHref = (href, base) => {
  try   { return new URL(href, base).href; }
  catch { return href; }
};

/**
 * extractStylesheetImports(css)                    -> { code, imports }
 * extractStylesheetImports(css, { mode: 'strip' }) -> code without the rules
 * -> { code: string, imports: { href, layer, media, rule, supports }[] }
 *
 * a constructed stylesheet cannot carry @import — replace() and replaceSync() drop
 * the rules per spec — so anything building one has to take them out beforehand and
 * load them some other way. see adoptStylesheet's `imports` option.
 *
 * @param {string} css
 * @param {{ base?: string, mode?: 'comment'|'keep'|'strip' }} [options]
 *        base — what a relative import url resolves against, default document.baseURI
 *        mode — what `code` does with the rules it found
 */
export function extractStylesheetImports (css, { base, mode = 'comment' } = {}) {
  const text = String(css ?? '');
  if (!text.includes('@import')) return { code: text, imports: [] };

  const from = base ?? (typeof document === 'undefined' ? undefined : document.baseURI);

  // blanking the comments keeps every index aligned, so a commented out rule is
  // skipped while the slices still come out of the original text
  const blanked = text.replace(COMMENT, match => ' '.repeat(match.length));
  const imports = [];
  const cuts    = [];

  for (const match of blanked.matchAll(IMPORT)) {
    const href = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5];
    const rule = text.slice(match.index, match.index + match[0].length);

    imports.push({ href: resolveHref(href.trim(), from), rule, ...splitCondition(match[6] ?? '') });
    cuts.push([match.index, match.index + match[0].length]);
  }

  if (!imports.length || mode === 'keep') return { code: text, imports };

  // built back to front so the earlier offsets stay valid
  let code = text;
  for (let i = cuts.length - 1; i >= 0; i--) {
    const [start, end] = cuts[i];
    const replacement  = mode === 'strip' ? '' : `/* ${imports[i].rule} */`;
    code = code.slice(0, start) + replacement + code.slice(end);
  }

  return { code, imports };
}

export default extractStylesheetImports;
