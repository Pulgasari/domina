# todo

beim arbeiten mit dem dom kam ich auf nachfolgende syntax-muster. es ist zu untersuchen, ob domina diese bereits unterstützt oder nicht. und falls nicht, sind diese nachzurüsten.

```javascript
dom.element(':root').setData({ theme });
dom.element(':root').dataset = { theme };
dom.root.dataset = { theme };
```

## scrolling

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

```javascript
dom.scrollToTop()
dom.jumpToTop()

dom.scrollToTop(10) // with offset
dom.jumpToTop(10) // with offset

dom.scrollToTop({ offset: 10, behaviour: smooth }) // with options
```

## on

```javascript
dom.element(spec).onResize
```
