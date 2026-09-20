import { zipSync, strToU8 } from 'fflate'
import {
  exportCSS,
  colorFamilies,
  palette,
  uiTokens,
  componentAliases,
  type DesignSystem,
} from './system'
export const starterCSS = `* { box-sizing: border-box; }
body { margin:0; background:var(--surface-canvas); color:var(--text-primary); font-family:var(--font-family); font-size:var(--type-body-size); line-height:var(--line-height-body); }
main { max-width:960px; margin:auto; padding:var(--space-8) var(--space-4); }
h1,h2,h3 { font-family:var(--font-heading); line-height:var(--line-height-heading); }
h1 { font-size:var(--type-heading-1-size); } h2 { font-size:var(--type-heading-2-size); }
a { color:var(--text-link); }
.stack { display:grid; gap:var(--space-4); } .row { display:flex; gap:var(--space-3); flex-wrap:wrap; align-items:center; }
.card { background:var(--card-background); border:1px solid var(--card-border); border-radius:var(--radius-lg); box-shadow:var(--shadow); padding:var(--space-6); }
.button { font:inherit; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-height:44px; padding:var(--space-2) var(--space-4); border:1px solid transparent; border-radius:var(--radius); background:var(--button-background); color:var(--button-text); transition:background var(--duration-fast) var(--ease-standard); }
.button:hover:not(:disabled) { background:var(--button-hover); } .button:active:not(:disabled) { background:var(--button-active); }
.button.secondary { background:var(--surface-default); color:var(--text-primary); border-color:var(--border-strong); }
.button.secondary:hover:not(:disabled) { background:var(--surface-subtle); }
.button.danger { background:var(--error-solid); color:var(--error-on-solid); }
.button.danger:hover:not(:disabled) { background:var(--error-text); color:var(--error-surface); }
:where(button,input,select,textarea,a):focus-visible { outline:2px solid var(--focus-ring); outline-offset:3px; }
:disabled { opacity:var(--opacity-disabled); cursor:not-allowed; }
label { display:grid; gap:var(--space-2); }
input,select,textarea { width:100%; font:inherit; padding:var(--space-3); color:var(--input-text); background:var(--input-background); border:1px solid var(--input-border); border-radius:var(--radius); }
[aria-invalid="true"] { border-color:var(--input-invalid); } .field-message { color:var(--error-text); background:var(--error-surface); }
.badge { display:inline-block; padding:var(--space-1) var(--space-2); border-radius:var(--radius-sm); border:1px solid; font-size:var(--type-label-size); }
.alert { padding:var(--space-4); border:1px solid; border-radius:var(--radius); }
${['success', 'warning', 'error', 'info'].map((role) => `.alert.${role}, .badge.${role} { background:var(--${role}-surface); color:var(--${role}-text); border-color:var(--${role}-border); }`).join('\n')}
progress { width:100%; accent-color:var(--action-primary); }
table { width:100%; border-collapse:collapse; } th,td { padding:var(--space-3); text-align:left; border-bottom:1px solid var(--border-default); }
details { border-bottom:1px solid var(--border-default); padding:var(--space-3) 0; } summary { cursor:pointer; font-weight:600; }
dialog { width:min(90vw,480px); background:var(--dialog-background); color:var(--text-primary); border:1px solid var(--border-default); border-radius:var(--radius-lg); padding:var(--space-6); box-shadow:var(--shadow); } dialog::backdrop { background:rgb(0 0 0 / .45); }
@media(max-width:600px) { main { padding:var(--space-4); } .card { padding:var(--space-4); } }
`
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )
export function bundleFiles(s: DesignSystem): Record<string, string> {
  const name = escape(s.name)
  return {
    'tokens.css': exportCSS(s),
    'components.css': starterCSS,
    'bloom.json': JSON.stringify(s, null, 2),
    'tokens.json': JSON.stringify(
      {
        primitives: Object.fromEntries(
          Object.entries(colorFamilies(s)).map(([key, value]) => [
            key,
            Object.fromEntries(palette(value).map((p) => [p.step, p.color])),
          ]),
        ),
        themes: { light: uiTokens(s, 'light'), dark: uiTokens(s, 'dark') },
        components: componentAliases,
      },
      null,
      2,
    ),
    'index.html': `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} system</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="components.css"></head><body><main class="stack"><header><h1>${name}</h1><p>${escape(s.description || 'A foundation for your next project.')}</p><button class="button secondary" id="theme">Toggle light / dark</button></header><section class="card stack"><h2>Actions and inputs</h2><div class="row"><button class="button" id="save">Save changes</button><button class="button secondary">Secondary</button><button class="button danger">Delete</button><button class="button" disabled>Unavailable</button></div><label>Email address<input type="email" placeholder="you@example.com"></label><label>Invalid field<input aria-invalid="true" aria-describedby="validation" value="invalid"></label><small id="validation" class="field-message">Enter a valid value.</small></section><section class="card stack"><h2>Feedback</h2>${['success', 'warning', 'error', 'info'].map((role) => `<div class="alert ${role}"><strong>${role[0]!.toUpperCase() + role.slice(1)}</strong> has its own surface, text, and border roles.</div>`).join('')}<p id="saved" role="status"></p></section><section class="card stack"><h2>Structure</h2><div class="row"><span class="badge success">Ready</span><span class="badge warning">Review</span></div><label>Progress<progress max="100" value="64">64%</progress></label><details><summary>How do tokens work?</summary><p>Components use semantic roles. Change the role once to update every component that uses it.</p></details><table><caption>Component inventory</caption><thead><tr><th>Component</th><th>Status</th></tr></thead><tbody><tr><td>Button</td><td>Ready</td></tr><tr><td>Field</td><td>Ready</td></tr></tbody></table><button class="button secondary" id="open">Open dialog</button></section><dialog id="dialog" aria-labelledby="dialog-title"><h2 id="dialog-title">A shared foundation</h2><p>This dialog follows your surface, typography, radius, and spacing tokens.</p><form method="dialog"><button class="button">Close</button></form></dialog></main><script>document.querySelector('#theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark'};document.querySelector('#save').onclick=()=>{document.querySelector('#saved').textContent='Changes saved in this demonstration.'};document.querySelector('#open').onclick=()=>document.querySelector('#dialog').showModal();</script></body></html>`,
    'README.md': `# ${s.name}\n\nOpen index.html to explore the system. Import tokens.css before components.css in your application. Set data-theme="dark" on the html element for dark mode.\n\n## Included\n70 palette shades; semantic surface, text, border, action and feedback roles for both appearances; component aliases; typography, spacing, radius, elevation and motion; responsive starter styles for buttons, fields, cards, alerts, badges, tables, disclosures, progress and native dialogs.\n\n## Token hierarchy\nPrimitives describe values. Semantic roles describe purpose. Component aliases apply roles to controls. Prefer semantic roles over palette hex values in application code. tokens.json documents the layers; bloom.json can be imported back into Bloom.\n\n## Usage\nUse .button, .card, .alert.success, .alert.warning, .alert.error, .alert.info and .badge classes. Keep field labels visible; associate validation using aria-describedby and aria-invalid. Pair status colors with text. Reduced-motion CSS is included.\n\n## Limits\nThis is a starting system, not an audited component framework. Review contrast for your actual content and adjacent surfaces. Status text/surface pairs target 4.5:1 and status borders target 3:1. Disabled states are not contrast-certified. Fonts load from Google Fonts; system fallbacks work offline. Icon selection stays in bloom.json; export the SVG sprite separately from Bloom's Icon set page.\n`,
  }
}
export function exportCode(s: DesignSystem) {
  return zipSync(
    Object.fromEntries(
      Object.entries(bundleFiles(s)).map(([name, content]) => [name, strToU8(content)]),
    ),
  )
}
