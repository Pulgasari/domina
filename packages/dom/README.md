# @domina/dom

the two apis of domina in one import: `dom` reads like `document` (`@domina/proxy`), and called
it is `d()` (`@domina/chain`), like `$` of jquery. `d` and `dd` come along.

```js
import { dom, d, dd } from '@domina/dom';

dom.title = 'notes';                                   // native, as on document
dom.querySelector({ id: 'app' });                      // gaps filled (@domina/proxy)
dom.getElements('.card').find({ active: true });
dom.meta.description = 'my notes';
dom.observer.observe('.card', { onMatch: card => … });

dom('.card').style({ opacity: 1 });                    // d('.card'), a chain
dd('.card').text;                                      // getters for every element
```

proxy and chain stay two packages with two apis, `dom` only joins them.
