# todo

## wrap / unwrap

wrap an element into a new or existing one, and the reverse: the wrapper goes, its
children take its place. built and tested once, taken out again: `wrap` is taken,
`HTMLTextAreaElement.prototype.wrap` reflects the wrap attribute, so `textarea.wrap()`
would be a string and the types do not hold.

candidates, all free on every element class in chromium (checked 2026-10):

- `nest` / `unnest`
- `pack` / `unpack`
- `group` / `ungroup`
- `wrapElement` / `unwrapElement`
- `enclose` / `dissolve`

nest/unnest and pack/unpack read best, both a bit ambiguous still. undecided.
`frame` is taken (`HTMLTableElement.prototype.frame`).
