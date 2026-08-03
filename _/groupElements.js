// groupElements.js

import { _el, getElement, getElements } from './core.js';
import { isFn, isString }               from './utils.js';
import { createElement }                from './create.js';
import { getValue }                     from './values.js';

const MARK = 'data-domina-group';

export function groupElements ({
  container,
  item,
  by,                       // Selector-String | fn(el) -> key
  header = null,            // fn(key, items) -> Node | String  (String = Tag, Key als Text)
  sort = 'asc',             // 'asc' | 'desc' | false | fn(a, b)
  groupClass = null,
  emptyKey = '—',
}) {
  const $container = _el(container);
  if (!$container) {
    console.warn('groupElements: container not found.', container);
    return [];
  }

  // Header vom letzten Lauf entfernen, sonst stapeln sie sich
  $container.querySelectorAll(`[${MARK}]`).forEach(el => el.remove());

  const items = getElements(item, $container);

  const keyOf = el => {
    const raw = isFn(by) ? by(el) : getValue(getElement(by, el));
    const key = String(raw ?? '').trim();
    return key || emptyKey;
  };

  const map = new Map();
  for (const el of items) {
    const key = keyOf(el);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(el);
  }

  let keys = [...map.keys()];
  if (isFn(sort))       keys.sort(sort);
  else if (sort)        keys.sort((a, b) =>
                          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
                          * (sort === 'desc' ? -1 : 1));

  const frag = document.createDocumentFragment();
  const groups = [];

  for (const key of keys) {
    const groupItems = map.get(key);
    let headerEl = null;

    if (header) {
      const made = isFn(header) ? header(key, groupItems) : header;
      headerEl = isString(made) ? createElement(made, {}, key) : made;

      if (headerEl) {
        headerEl.setAttribute(MARK, key);
        if (groupClass) headerEl.classList.add(groupClass);
        frag.append(headerEl);
      }
    }

    frag.append(...groupItems);
    groups.push({ key, items: groupItems, header: headerEl });
  }

  $container.append(frag);
  return groups;
}

export default groupElements;
