# Localization (L10N)

## Locale Resolution

The widget picks a locale in this order:

1. `window.__VALKI_LOCALE__` (forced locale)
2. `navigator.languages`
3. Fallback to `en`

## Supported Locales

`en`, `nl`, `de`, `fr`, `es`, `it`, `pt`, `pl`, `tr`, `ar`, `ja`, `zh`, `ko`

## Force a Locale

```html
<script>
  window.__VALKI_LOCALE__ = 'nl';
</script>
<script defer src="https://cdn.example.com/widget/valki-talki.js"></script>
```

## Override Strings

Provide optional string overrides using `window.__VALKI_I18N_OVERRIDES__`. Only string values are applied.

```html
<script>
  window.__VALKI_I18N_OVERRIDES__ = {
    'button.login': 'Sign in',
    'placeholder.composer': 'Ask a question...'
  };
</script>
```
