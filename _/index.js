// @domina

// ::: create
import * as createMethods from './create.js';
//import * as    getMethods from './get.js';
import * as formMethods   from './form.js';
import * as eventsMethods from './events.js';
import * as miscMethods   from './misc.js';
import * as rafMethods    from './raf.js';
import * as valueMethods  from './values.js';


// ::: get
import getElement            from './core.js';
import getElementById        from './core.js';
import getElements           from './core.js';
import getElementsByDataAttr from './core.js';
import getElementsByDataKey  from './core.js';

// ::: misc
import filterElements from './filterElements.js';
import groupElements  from './groupElements.js';
import sortElements   from './sortElements.js';
import updateElement  from './updateElement.js';

/*
import insertElement from './insertElement.js';
import resolveEDO    from './resolveEDO.js';
*/

export default {
  getElement,
  getElementById,
  getElements,
  getElementsByDataAttr,
  getElementsByDataKey,

  filterElements,
  groupElements,
  sortElements,
  updateElement,
  
  element  : getElement,
  elements : getElements,

  ...createMethods,
  ...eventsMethods,
  ...formsMethods,
  ...miscMethods,
  ...rafMethods,
  ...valueMethods,
}


/*

aufbau.get({ id: 'app-header' })
aufbau.get('#app-header')

aufbau.dom.get({ id: 'app-header' })
aufbau.dom.get('#app-header'

domina.get({ id: 'app-header' })
domina.get('#app-header')

dom.get({ id: 'app-header' })
dom.get('#app-header')

dom.element({ id: 'app-header' })
dom.element('#app-header')

dom.elements({ dataKey: 'app-header' })
dom.elements('#app-header')

aufbau.dom.element({ id: 'app-header' })
aufbau.dom.element('#app-header')

*/










