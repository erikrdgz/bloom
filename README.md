# Bloom

[Live demo](https://erikrdgz.github.io/bloom/) · [Source](https://github.com/erikrdgz/bloom)

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

Bloom keeps its cherry-blossom identity: light pink accents, slate daylight surfaces, blue ink at night, and the original animated blossom tree against its moon backdrop. The tree combines detailed photographic wood with editable SVG blossoms that inherit the primary token; its artwork, motion, and color behavior are unchanged. Softer studio controls and floating rounded panels frame this existing identity. Supporting graphics include the component workshop's technical drawing and a small original cherry-blossom study, rather than replacing the signature tree. All artwork is bundled locally.

The default Bloom reference uses DM Sans for both interface text and headings, with weight and size establishing hierarchy. Hero emphasis uses a contrast-checked shade of the primary pink, including the original pink in dark mode. Decorative workshop colors follow the active brand and neutral tokens; success colors remain semantic.

The shell supports light and dark appearances and responsive desktop, tablet, and phone layouts. Active system fonts and neutral surfaces still flow through the studio; default studio actions have at least a 24px corner radius, while saved custom button styles take precedence exactly. Component specimens and exported token radii remain faithful to the selected system. Earlier drafts and v1 JSON exports remain compatible.

## Features

- **The studio follows your system:** selected body and heading fonts apply throughout Bloom, including banners, navigation, dialogs, and the builder. Code keeps a monospace face. Saved system button styles immediately update Create, Save, Export, and other action buttons; linked and detached variants retain their relationships. Returning to the builder opens the saved source for each component type. Switching systems or reloading restores the corresponding typography and styling.

- **Component builder (beta):** customize twelve component types with a live preview, linked or independent corner sliders and pixel fields, fill/text/border colors, padding, typography, borders, drop shadows, glow, and five appearance presets. Save named variants to the active system. Switch between Preview and Code to copy Plain HTML/CSS (with JavaScript where needed), React TSX, Vue SFC, or standalone Angular files. Generated code follows live edits, linked styles, system fonts, and the disabled preview state; no Bloom runtime or icon package is needed. Saving from the original Bloom reference creates an editable copy.
- **Linked variants:** the first saved button becomes the system button and creates secondary, quiet, and danger variants. Linked variants inherit shape, spacing, typography, border width/style, shadows, and glow while keeping their own colors. Detach to edit independently or relink to the source. Custom button appearances also apply to the existing catalog and overview specimens. Any saved component can be used to create a linked variant.
- **System view:** inspect saved components alongside all color palettes, semantic roles, light/dark surfaces, typography, spacing, shape, elevation, motion, selected icons, and the full reference component catalog. Open a saved component directly in the builder. Variants and relationships persist per system and are included in JSON and code exports; CSS exports contain resolved appearance classes. PDF exports remain a foundations reference.

- **Ready on arrival:** Bloom includes a generated primary palette, semantic colors, six type specimens, eight spacing steps, and an interactive component catalog.
- **Foundations:** edit primary and secondary colors, success/warning/error/information palettes, neutral surfaces, heading and body fonts, base size and type scale, spacing, radius, elevation, and motion. Component previews respond immediately.
- **Components:** fourteen documented families, including validated inputs, keyboard-navigable tabs, sorting and row selection, and native modal focus management. Button, switch, dialog, and specimen wrappers are reusable Vue components. Examples are local demonstrations.
- **Motion:** dropdown and color-picker enter/exit transitions, cascading page entrances, and expanding builder sections follow the active system timing profile. Page headings lead a short stagger through visible sections and cards; navigation interrupts unfinished motion immediately. Timing and easing references, replayable transitions, reduced-motion previews, and CSS motion variables are included in exports. System reduced-motion preferences are always respected.
- **Developer mode:** inspect and copy generated CSS custom properties, including the selected Google Fonts imports.
- **Light and dark:** the studio includes both themes; exports include base surface and text values for both modes.
- **Create:** six steps covering project details, visual direction, primary/secondary palettes, heading/body font pairing and type scale, spacing/radius/elevation/motion, and review. A live light/dark preview updates throughout. Creation adds a saved system without replacing existing work.
- **Import:** validate Bloom v1 JSON, trim names, normalize hex colors, and deduplicate icons. A malformed import never changes the working system. Valid imports add a separate saved system.
- **Export:** download a code ZIP with tokens, responsive component styles, an interactive HTML demo, structured token JSON, and reimportable Bloom configuration; or a six-page PDF reference covering colors, both appearances, typography, spacing, motion, and component roles. Individual CSS and JSON downloads remain available.
- **Icon set:** browse all 2,060 unique Font Awesome Free 6.7.2 icons (1,402 solid, 163 regular, 495 brands), search names and aliases, filter by style or selected icons, and export the full selection as an SVG symbol sprite. Artwork loads on demand; results are paginated. Existing solid-icon IDs remain compatible; regular and brand IDs use `far-` and `fab-` prefixes. Run `npm run icons:generate` after updating the icon packages to refresh the lightweight catalog. Preview size/color do not alter the sprite, which inherits styling when used.
- **Local drafts:** multiple systems and appearance preferences persist in this browser. The workspace selector changes Bloom’s own theme; the botanical illustrations retain their structure. Export JSON to back up or transfer work.

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

Import currently accepts this application's JSON format only. General CSS/Figma/DTCG ingestion and a full distributable Vue component library remain future work. Exports include 70 palette shades, light/dark semantic UI roles, component aliases, six typography styles, and spacing, elevation, and motion decisions. Feedback text/surface pairs target 4.5:1 contrast and feedback borders target 3:1. These pair checks do not replace testing actual interfaces. The code bundle provides a usable HTML/CSS starting system. PDF references use Helvetica while documenting your selected fonts.

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

Bloom’s original light-pink system is always available. It is view-only. Editing controls guide visitors to create their own system without creating an automatic copy. The shared rounded color picker supports hex entry and hue, saturation, and lightness. Six onboarding presets coordinate fonts, colors, spacing, corners, elevation, and motion. Dropdowns share a custom keyboard-accessible popover control. Native popovers remain in the top layer during their closing animation; browsers without discrete-transition support close immediately. Page navigation moves focus to the heading and disables outgoing content. Motion previews offer actual, slow, and study playback; playback speed does not change exported timing tokens. Developer mode shows page-specific output and expandable component references with values for the current appearance.

## GitHub Pages

The Pages workflow validates and builds the app, then deploys `dist` on every push to `main`. Set **Settings → Pages → Source** to **GitHub Actions**. Asset paths use the repository’s Pages base path, so the tree, favicon, and application bundles work beneath `/bloom/` as well as a custom domain.

To check a repository-path build locally:

```sh
npm run build -- --base=/bloom/
npm run preview -- --base=/bloom/
```

Open `http://127.0.0.1:4173/bloom/`. The site has no backend; visitors’ systems stay in their own browser storage.

## Design direction

Keep the interface focused on useful content and actions. Avoid decorative status dots, generic straplines, redundant uppercase eyebrows, arbitrary section numbers, version badges, and repeated helper text. Use spacing and typography to group content; dividers should clarify a real boundary. Keep “A little structure. Room to grow.” visible beneath the sidebar logo. Preserve the original cherry-blossom tree and pink/slate brand palette.
