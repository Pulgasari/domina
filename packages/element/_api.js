// @domina/element/_api.js
//
// single source of truth shared by the eager (index.js) and lazy (lazy.js)
// variants: the sugar surface as sugar-name -> [methodName, kind].
//
// methodName is the @domina/methods module/export name. kind drives the
// return handling:
//   chain : method returns an element -> subject switches, handle rewraps
//   self  : element lifecycle, return ignored, same handle kept
//   value : raw return value passed through
//   stop  : disposer passed through
//   child : child-addressing (sel first arg): method acts on getElement(sel, node)

const NODE = Symbol.for('domina.node');

export const isWrapped = value => value?.[NODE] === true;

export const API = {
  // self-acting shorthands (act on this.node)
  empty   : ['clearElement',   'self'],
  remove  : ['removeElement',  'self'],
  replace : ['replaceElement', 'self'],
  update  : ['updateElement',  'self'],
  wrap    : ['wrapElement',    'self'],
  unwrap  : ['unwrapElement',  'self'],

  // child-addressing counterparts: *Element(sel, ...)
  emptyElement   : ['clearElement',   'child'],
  removeElement  : ['removeElement',  'child'],
  replaceElement : ['replaceElement', 'child'],
  updateElement  : ['updateElement',  'child'],
  wrapElement    : ['wrapElement',    'child'],
  unwrapElement  : ['unwrapElement',  'child'],

  // disposers
  delegate  : ['delegateEvent',    'stop'],
  onOutside : ['onOutsideEvent',   'stop'],
  onEvent   : ['onEvent',          'stop'],
  onceEvent : ['onceEvent',        'stop'],

  // value getters / predicates
  getChildren  : ['getChildren',           'value'],
  getCssVar    : ['getCustomProperty',     'value'],
  getAttr      : ['getAttr',               'value'],
  getClass     : ['getClass',              'value'],
  getData      : ['getData',               'value'],
  getHTML      : ['getHTML',               'value'],
  getStyle     : ['getStyle',              'value'],
  getText      : ['getText',               'value'],
  getValue     : ['getValue',              'value'],
  getParents   : ['getParents',            'value'],
  getSiblings  : ['getSiblings',           'value'],
  getIndex     : ['getIndex',              'value'],
  getOffset    : ['getElementOffset',      'value'],
  getPosition  : ['getElementPosition',    'value'],
  getRect      : ['getElementRect',        'value'],
  getSize      : ['getElementSize',        'value'],
  hasAttr      : ['hasAttr',               'value'],
  hasClass     : ['hasClass',              'value'],
  hasData      : ['hasData',               'value'],
  emitEvent    : ['emitEvent',             'value'],
  offEvent     : ['offEvent',              'value'],
  isInViewport : ['isElementInViewport',   'value'],
  matches      : ['matchesElement',        'value'],

  // chaining (return an element)
  appendTo     : ['appendToElement',   'chain'],
  prependTo    : ['prependToElement',  'chain'],
  insertBefore : ['insertBefore',      'chain'],
  insertAfter  : ['insertAfter',       'chain'],
  clone        : ['cloneElement',      'chain'],
  moveTo       : ['moveTo',            'chain'],
  addClass     : ['addClass',          'chain'],
  getClosest   : ['getClosest',        'chain'],
  getNext      : ['getNext',           'chain'],
  getParent    : ['getParent',         'chain'],
  getPrev      : ['getPrev',           'chain'],
  jumpTo       : ['jumpTo',            'chain'],
  scrollTo     : ['scrollTo',          'chain'],
  setAttr      : ['setAttr',           'chain'],
  setClass     : ['setClass',          'chain'],
  setCssVar    : ['setCustomProperty', 'chain'],
  setContent   : ['setContent',        'chain'],
  setData      : ['setData',           'chain'],
  setHTML      : ['setHTML',           'chain'],
  setStyle     : ['setStyle',          'chain'],
  setText      : ['setText',           'chain'],
  setValue     : ['setValue',          'chain'],
  removeAttr   : ['removeAttr',        'chain'],
  removeClass  : ['removeClass',       'chain'],
  removeData   : ['removeData',        'chain'],
  toggleAttr   : ['toggleAttr',        'chain'],
  toggleClass  : ['toggleClass',       'chain'],
};

export { NODE };
