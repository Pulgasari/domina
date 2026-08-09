# @domina/core

- alle methoden haben einen klaren präfix
- methoden, die aus nur einem wort bestehen, sind besondere namespaces

##

```javascript
dom.element(form).on({
  input  : show,
  change : show,
  reset  : () => setTimeout(show),
  submit : (event) => {
    event.preventDefault();
    console.log('valid:', form.checkValidity());
    show();
  }
});

dom.form(form).getValues();
dom.form(form).values;
```
