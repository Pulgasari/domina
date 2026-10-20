// @domina/proxy :: media

/*
media queries as values, read when asked:

  domina.media.dark                     prefers-color-scheme: dark
  domina.media.matches('(width < 48rem)')
  domina.media.on('(width < 48rem)', matches => …)   on a change, returns its stop

  domina.a11y.reducedMotion             prefers-reduced-motion: reduce
  domina.a11y.contrast                  prefers-contrast: more
  domina.a11y.forcedColors              forced-colors: active
  domina.a11y.reducedTransparency       prefers-reduced-transparency: reduce

a11y is its own namespace on purpose: the preferences of the user that a page
has to respect. on an element (@domina/element) this.media.on() stops when
the element is disconnected.
*/

const queryOf = text => globalThis.matchMedia?.(text) ?? null;
const matches = text => Boolean(queryOf(text)?.matches);

function on (text, fn) {
  const query = queryOf(text);
  if (!query) return () => {};
  const change = event => fn(event.matches, event);
  query.addEventListener('change', change);
  return () => query.removeEventListener('change', change);
}

export const media = {
  get coarse () { return matches('(pointer: coarse)'); },
  get dark   () { return matches('(prefers-color-scheme: dark)'); },
  get hover  () { return matches('(hover: hover)'); },
  get light  () { return matches('(prefers-color-scheme: light)'); },
  get print  () { return matches('print'); },
  matches,
  on,
};

export const a11y = {
  get contrast            () { return matches('(prefers-contrast: more)'); },
  get forcedColors        () { return matches('(forced-colors: active)'); },
  get reducedMotion       () { return matches('(prefers-reduced-motion: reduce)'); },
  get reducedTransparency () { return matches('(prefers-reduced-transparency: reduce)'); },
};
