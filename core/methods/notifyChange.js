// notifyChange.js

// Dispatches both input and change events
export const notifyChange = el => {
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

export default notifyChange;
