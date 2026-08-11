# todo

beim arbeiten mit dem dom kam ich auf nachfolgende syntax-muster. es ist zu untersuchen, ob domina diese bereits unterstützt oder nicht. und falls nicht, sind diese nachzurüsten.

```javascript
dom.element(':root').setData({ theme });
dom.element(':root').dataset = { theme };
dom.root.dataset = { theme };
```
```javascript
// original
if (anchor) {
  const targetEl = document.getElementById(anchor);
  if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' })
} else {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// mit domina
//anchor ? dom.scrollTo('#'+anchor) : dom.scrollToTop(0);
```

```javascript
dom.scrollTo(spec); // default behaviour smooth
dom.jumpTo(spec);   // a wrapper without default behaviour smooth
```
