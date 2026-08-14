// upsertHead.js

/** Finds an element in <head> via selector or creates and appends it. */
export const upsertHead = (selector, make) => {
  const head = document.head;
  let element = head.querySelector(selector);
  if (!element) {
    element = make();
    head.append(element);
  }
  return element;
};

export default upsertHead;
