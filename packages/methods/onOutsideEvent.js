// onOutsideEvent.js

import { resolveElement } from './resolveElement.js';

/** Click/tap outside element - common for dropdowns and dialogs. */
export function onOutsideEvent (spec, handler, { events = ['pointerdown'], escape = true, root = document } = {}) {
  const element = resolveElement(spec);
  if (!element) return () => {};

  // Armed on next frame to prevent immediate closing on initial trigger click
  let armed = false;
  requestAnimationFrame(() => { armed = true; });

  const onPointer = event => {
    if (!armed) return;
    const path = event.composedPath?.() ?? [];
    if (path.includes(element) || element.contains(event.target)) return;
    handler(event, element);
  };

  const onKey = event => { if (event.key === 'Escape') handler(event, element); };

  events.forEach(type => root.addEventListener(type, onPointer, true));
  if (escape) root.addEventListener('keydown', onKey);

  return () => {
    events.forEach(type => root.removeEventListener(type, onPointer, true));
    if (escape) root.removeEventListener('keydown', onKey);
  };
}

export default onOutsideEvent;
