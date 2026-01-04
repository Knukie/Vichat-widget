# Vichat Widget API Contract (Stable)

This document defines the stable public contract for the Vichat widget. Breaking changes follow the deprecation policy below and only occur on major version bumps.

## Embed Snippets

### Default (shadow DOM)
```html
<script
  defer
  src="https://cdn.example.com/widget/vichat-widget.js"
  data-vichat-tenant="valki"
  data-valki-base-url="https://auth.valki.wiki"
></script>
```

### Iframe mode
```html
<script
  defer
  src="https://cdn.example.com/widget/vichat-widget.js"
  data-vichat-tenant="valki"
  data-valki-base-url="https://auth.valki.wiki"
  data-valki-embed-mode="iframe"
></script>
```

## Config Sources + Precedence (Stable)

Configuration is resolved in the following order:

1. `data-` attributes on the loader script tag
2. Window globals (`window.__VALKI_*__`)
3. Defaults

## Supported Config Keys (Frozen)

These keys are stable and backward-compatible:

- `baseUrl`
- `embedMode`
- `mountSelector`
- `flags`
- `debug`
- `iframeSandbox`

## Iframe PostMessage Events

When `embedMode="iframe"`, the following event types are supported:

Host → iframe:
- `valki_open`
- `valki_close`
- `valki_send`

Iframe → host:
- `valki_ready`
- `valki_state`

## Backward Compatibility Promise

- Legacy localStorage migrations are preserved.
- The loader script URL remains stable with a compatible alias.

## Deprecation Policy

- Deprecations are announced in release notes.
- Deprecated fields continue to work for at least one minor version.
- Removals only occur in major releases with documented migration guidance.
