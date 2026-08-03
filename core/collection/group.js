// @domina/core/collection/group.js

import { getElement } from '../query.js';
import { getValue } from '../values.js';
import { createElement } from '../create.js';
import { isFn, isString } from '../internal/is.js';
import { resolveScope } from './shared.js';

const MARK = 'data-domina-group';

export function groupElements({
  container,
  item,
  by,                       // Selector-String | fn(el) -> key
  header = null,            // fn(key, items) -> Node | String  (String = Tag, Key als Text)
  sort = 'asc',             // 'asc' | 'desc' | false | fn(a, b)
  groupClass = null,
  emptyKey = '—',
}) {
  const scope = resolveScope('groupElements', container, item);
  if (!scope) return [];

  const { $container: $c, items } = scope;

  // Header vom letzten Lauf entfernen, sonst stapeln sie sich
  $c.querySelectorAll(`[${MARK}]`).forEach(el => el.remove());

  const keyOf = el => {
    const raw = isFn(by) ? by(el) : getValue(getElement(by, el));
    return String(raw ?? '').trim() || emptyKey;
  };

  const map = new Map();
  for (const el of items) {
    const key = keyOf(el);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(el);
  }

  const keys = [...map.keys()];
  if (isFn(sort))  keys.sort(sort);
  else if (sort)   keys.sort((a, b) =>
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

  $c.append(frag);
  return groups;
}
