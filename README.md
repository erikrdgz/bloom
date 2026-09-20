# Bloom

A small, open-source design system studio built with Vue 3 and TypeScript. Explore a complete starter system on first load, tune its foundations, and export what you need for your next project.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

```sh
npm test         # focused token and import validation tests
npm run build   # strict TypeScript check + production build
npm run preview # preview the production build
```

## Visual identity

Bloom uses a quiet Japanese-inspired aesthetic with English-only typography: slate daylight surfaces, blue ink at night, and a hybrid blossom tree against a moon backdrop. A 1536 × 1024 transparent photographic wood layer supplies detailed bark and natural branches; editable SVG blossoms inherit the primary token directly. Wood and moonlight remain independent of the brand color. The locally bundled wood asset was generated for this project. Local drafts and v1 JSON exports from earlier versions remain compatible.

## Features

- **Ready on arrival:** Bloom includes a generated primary palette, semantic colors, six type specimens, eight spacing steps, and an interactive component catalog.
- **Foundations:** edit primary and secondary colors, neutral surfaces, heading and body fonts, base size and type scale, spacing, radius, elevation, and motion. Component previews respond immediately.
- **Components:** fourteen documented families, including validated inputs, keyboard-navigable tabs, sorting and row selection, and native modal focus management. Button, switch, dialog, and specimen wrappers are reusable Vue components. Examples are local demonstrations.
- **Motion:** timing and easing references, replayable transitions, reduced-motion previews, and CSS motion variables included in exports. System reduced-motion preferences are always respected.
- **Developer mode:** inspect and copy generated CSS custom properties, including the selected Google Fonts imports.
- **Light and dark:** the studio includes both themes; exports include base surface and text values for both modes.
- **Create:** six steps covering project details, visual direction, primary/secondary palettes, heading/body font pairing and type scale, spacing/radius/elevation/motion, and review. A live light/dark preview updates throughout. Creation adds a saved system without replacing existing work.
- **Import:** validate Bloom v1 JSON, trim names, normalize hex colors, and deduplicate icons. A malformed import never changes the working system. Valid imports add a separate saved system.
- **Export:** download CSS custom properties or round-trip JSON configuration.
- **Icon set:** curate twelve Font Awesome Free icons and export the selected set as an SVG symbol sprite. Preview size/color do not alter the sprite, which inherits styling when used.
- **Local drafts:** multiple systems and appearance preferences persist in this browser. The workspace selector changes Bloom’s own theme; the botanical illustration retains its structure. Export JSON to back up or transfer work.

## Structure

```
src/
  components/     # navigation, palettes, live specimens, dialogs, icon studio
  components/ui/  # reusable component primitives
  composables/    # reactive platform preferences
  lib/motion.ts   # motion scale and CSS declarations
  lib/system.ts   # typed model, validation, generation, exports
  lib/system.test.ts
  App.vue         # workspace composition and local state
  style.css       # studio themes and responsive layout
```

No backend, account, router, or state-management package is required for this browser-based MVP. Browser storage is best-effort and device-local. Google Fonts require network access and fall back to the appropriate system font family.

## Scope and roadmap

Import currently accepts this application's JSON format only. General CSS/Figma/DTCG ingestion, token alias resolution, contrast audits, semantic token editing, component source generation, and theme-specific palettes remain future work. The CSS export includes the six generated typography styles and four semantic colors shown in the studio. Exports are starting foundations, not a full distributable Vue component library.

## Contributing

Small, focused contributions are welcome. Open an issue with the problem and a concrete example before major changes. Keep the dependency list small and put reusable logic in `src/lib`. Run `npm test` and `npm run build` before submitting a pull request. Include desktop and mobile screenshots for UI changes.

## License and credits

Bloom code is MIT licensed. See [LICENSE](LICENSE).

- Vue, Vite, Vitest, and TypeScript provide the application and tooling.
- Lucide icons: ISC license.
- Font Awesome Free 6 icons: CC BY 4.0; packaged code: MIT. Attribution is included in exported sprites. See [Font Awesome licensing](https://fontawesome.com/license/free).
- DM Sans, Space Grotesk, Cormorant Garamond, and IBM Plex Mono are loaded through Google Fonts and distributed under the SIL Open Font License.

## Font library

Choose heading and body fonts independently from DM Sans, Space Grotesk, Inter, Manrope, Plus Jakarta Sans, Outfit, Nunito Sans, Source Sans 3, Lora, Libre Baskerville, Cormorant Garamond, and IBM Plex Mono, plus the device system font. Selected fonts load on demand from Google Fonts; generic fallbacks work offline. CSS exports include the font stylesheet imports.

Bloom’s original light-pink system is always available. Editing it creates a separate Bloom study, preserving the original. Dropdowns share a custom keyboard-accessible popover control. Motion previews offer actual, slow, and study playback; playback speed does not change exported timing tokens. Developer mode shows page-specific output and expandable component references with values for the current appearance.

## GitHub Pages

The Pages workflow validates and builds the app, then deploys `dist` on every push to `main`. Set **Settings → Pages → Source** to **GitHub Actions**. Asset paths use the repository’s Pages base path, so the tree, favicon, and application bundles work beneath `/bloom/` as well as a custom domain.

To check a repository-path build locally:

```sh
npm run build -- --base=/bloom/
npm run preview -- --base=/bloom/
```

Open `http://127.0.0.1:4173/bloom/`. The site has no backend; visitors’ systems stay in their own browser storage.
