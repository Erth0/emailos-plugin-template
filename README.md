# EmailOS Plugin Template

A GitHub template for building EmailOS plugins. Click **Use this
template** (or `gh repo create my-plugin --template
Erth0/emailos-plugin-template`), then edit `emailos.plugin.json`: set your
own `id` (reverse-DNS style, e.g. `com.you.myplugin`), name, and
description.

You get a working plugin out of the box — a palette command with a
free-text input step, an event listener, and a full page (view) styled
with the app's design kit — plus complete typings for the `emailos` API
(`emailos.d.ts`), so plain JavaScript gets full IntelliSense with zero
build step.

## Develop

1. In EmailOS: Preferences → Extensions → enable **Developer mode**.
2. **Load local plugin** → pick this folder. Review the permission consent
   screen and Install.
3. Sensitive permissions (`mail.read.*`, `mail.modify`, `network.*`) start
   **off** — toggle them on via the permission chips on your plugin's card.
4. Edit `entry.js`, then hit **Reload** in the Extensions pane. Watch the
   plugin log there for errors and permission denials.

If you want TypeScript or a framework (Preact fits comfortably), bundle to
a single `entry.js` ≤ 256 KB and point the manifest `entry` at the output.

## The pieces

- `emailos.plugin.json` — your manifest: identity, permissions, commands
  (with optional `inputPlaceholder` for a free-text step), UI slots, views
  (full pages), and event subscriptions.
- `entry.js` — one file, two contexts: the hidden background sandbox
  (register commands/listeners) and each view document (`emailos.view` is
  set — render your page). Views get the app's design tokens
  (`var(--background)`, `var(--foreground)`, …) and the `eos-*` CSS kit
  injected, so pages look native by default; ignore them if you want a
  custom look.
- `emailos.d.ts` — the full API, each call documented with the permission
  it requires.

## Rules of the road

- Renaming the manifest `id` after install is a new plugin.
- No DOM outside your own view, no direct fetch — use `emailos.net.fetch`
  under a declared `network.<host>` permission (host or subdomain match,
  https only).
- Entry code is copied at install; disk edits apply on Reload.

## Targets

This template targets the EmailOS plugin API v1 (`apiVersion: 1`). The
canonical, always-current copy lives in the EmailOS repo at
`templates/plugin-starter/`. Full authoring guide:
<https://github.com/Erth0/emailos/blob/main/docs/developer/plugin-authoring.md>
