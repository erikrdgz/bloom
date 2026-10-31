import { componentStyle, resolveComponent, type SavedComponent } from './builder'
import type { DesignSystem } from './system'
import { fontFamily, fontStylesheet } from './fonts'

export const codeFormats = ['Plain', 'React', 'Vue', 'Angular'] as const
export type CodeFormat = (typeof codeFormats)[number]
export interface CodeFile {
  name: string
  language: string
  content: string
}
const editable = new Set(['button', 'input', 'textarea', 'select', 'switch', 'checkbox', 'tabs'])
const escapeHTML = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
const literal = (text: string) =>
  JSON.stringify(text)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
const indent = (text: string, spaces = 2) =>
  text
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n')

// Format our generated tags without splitting JSX arrow functions at their > character.
function formatMarkup(source: string) {
  const tokens: string[] = []
  let index = 0
  while (index < source.length) {
    if (source[index] !== '<') {
      const end = source.indexOf('<', index)
      const text = source.slice(index, end < 0 ? source.length : end).trim()
      if (text) tokens.push(text)
      index = end < 0 ? source.length : end
      continue
    }
    let end = index + 1
    let quote = ''
    let braces = 0
    for (; end < source.length; end++) {
      const char = source[end]!
      if (quote) {
        if (char === quote && source[end - 1] !== '\\') quote = ''
        continue
      }
      if (char === '"' || char === "'") {
        quote = char
        continue
      }
      if (char === '{') braces++
      if (char === '}') braces--
      if (char === '>' && braces === 0) break
    }
    tokens.push(source.slice(index, end + 1))
    index = end + 1
  }
  let depth = 0
  return tokens
    .map((token) => {
      if (token.startsWith('</')) depth--
      const line = '  '.repeat(Math.max(0, depth)) + token
      if (
        /^<[a-z]/i.test(token) &&
        !/\/>$/.test(token) &&
        !/^<(input|br|hr|img|link)\b/i.test(token)
      )
        depth++
      return line
    })
    .join('\n')
}

export function componentCode(
  draft: SavedComponent,
  system: DesignSystem,
  format: CodeFormat,
  disabled = false,
): CodeFile[] {
  const component = resolveComponent(draft, system.components)
  const { kind } = component
  const words = component.name.match(/[a-z0-9]+/gi) ?? ['Custom', kind]
  const name = 'Bloom' + words.map((word) => word[0]!.toUpperCase() + word.slice(1)).join('')
  const file = words.join('-').toLowerCase()
  const scope = 'bloom-' + component.id.replace(/[^a-z0-9-]/gi, '').toLowerCase()
  const plain = format === 'Plain'
  const react = format === 'React'
  const vue = format === 'Vue'
  const text = plain ? escapeHTML(component.label) : react ? '{label}' : '{{ label }}'
  const attr = (key: string, expression: string) =>
    react
      ? `${key === 'tabindex' ? 'tabIndex' : key}={${expression}}`
      : vue
        ? `:${key}="${expression}"`
        : `[${key.startsWith('aria-') || key === 'tabindex' ? 'attr.' : ''}${key}]="${expression}"`
  const classes = (value: string) => `${react ? 'className' : 'class'}="${value}"`
  const off = editable.has(kind)
    ? plain
      ? disabled
        ? ' disabled'
        : ''
      : ' ' + attr('disabled', 'disabled')
    : ''
  const id = (suffix: string) =>
    plain ? `id="${scope}-${suffix}"` : attr('id', `id + '-${suffix}'`)
  const ref = (key: string, suffix: string) =>
    plain ? `${key}="${scope}-${suffix}"` : attr(key, `id + '-${suffix}'`)
  const icon = (path: string) =>
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${react ? 'strokeWidth' : 'stroke-width'}="2" aria-hidden="true"><path d="${path}" /></svg>`
  const arrow = icon('M5 12h14m-6-6 6 6-6 6')
  const info = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${react ? 'strokeWidth' : 'stroke-width'}="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v2" /></svg>`
  const piece = classes('piece')
  let markup = ''
  switch (kind) {
    case 'button':
      markup = `<button type="button" ${piece}${off}>\n  ${text}\n  ${arrow}\n</button>`
      break
    case 'input':
      markup = `<label ${classes('field')}><span>${text}</span>\n  <input type="text" ${piece} placeholder="Start typing…"${off} />\n</label>`
      break
    case 'textarea':
      markup = `<label ${classes('field')}><span>${text}</span>\n  <textarea ${piece} ${react ? 'rows={3}' : 'rows="3"'} placeholder="Put it into words."${off}></textarea>\n</label>`
      break
    case 'select':
      markup = `<label ${classes('field')}><span>${text}</span>\n  <select ${piece}${off}><option>Design</option><option>Engineering</option><option>Product</option></select>\n</label>`
      break
    case 'badge':
      markup = `<span ${piece}>${text}</span>`
      break
    case 'card':
      markup = `<article ${piece}><h3>${text}</h3><p>A card groups related content and actions.</p>${arrow.replace('width="16" height="16"', 'width="20" height="20"')}</article>`
      break
    case 'alert':
      markup = `<div ${piece} role="status">${info}<div><strong>${text}</strong><p>Your changes have been saved.</p></div></div>`
      break
    case 'switch':
    case 'checkbox':
      markup = `<label ${classes('check-label')}>\n  <input type="checkbox"${kind === 'switch' ? ' role="switch"' : ''} ${react ? 'defaultChecked' : 'checked'}${off} />\n  <span ${piece} aria-hidden="true">${kind === 'switch' ? `<span ${classes('thumb')}></span>` : icon('m5 12 4 4L19 6').replace('width="16" height="16"', 'width="18" height="18"')}</span>\n  <span>${text}</span>\n</label>`
      break
    case 'tooltip':
      markup = `<div ${classes('tooltip-wrap')}>\n  <button type="button" ${ref('aria-describedby', 'tip')}>A helpful detail ${info}</button>\n  <span ${piece} role="tooltip" ${id('tip')}>${text}</span>\n</div>`
      break
    case 'progress':
      markup = `<div ${classes('field')}><span>${text} <span>64%</span></span>\n  <div ${classes('progress')} role="progressbar" ${plain ? `aria-label="${escapeHTML(component.label)}"` : attr('aria-label', 'label')} ${react ? 'aria-valuenow={64} aria-valuemin={0} aria-valuemax={100}' : 'aria-valuenow="64" aria-valuemin="0" aria-valuemax="100"'}><div ${piece}></div></div>\n</div>`
      break
    case 'tabs': {
      const listener = plain
        ? ''
        : react
          ? ' onKeyDown={handleKey}'
          : vue
            ? ' @keydown="handleKey"'
            : ' (keydown)="handleKey($event)"'
      const buttons = [text, 'Activity', 'Settings']
        .map((label, index) => {
          const selected = plain
            ? `aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}"`
            : `${attr('aria-selected', `active === ${index}`)} ${attr('tabindex', `active === ${index} ? 0 : -1`)}`
          const click = plain
            ? ''
            : react
              ? ` onClick={() => setActive(${index})}`
              : vue
                ? ` @click="active = ${index}"`
                : ` (click)="active = ${index}"`
          return `  <button type="button" role="tab" ${piece} ${id('tab-' + index)} ${ref('aria-controls', 'panel-' + index)} ${selected}${off}${click}>${label}</button>`
        })
        .join('\n')
      const panels = [
        'Everything in its place.',
        'Your latest updates appear here.',
        'Make yourself at home.',
      ]
        .map(
          (label, index) =>
            `<div role="tabpanel" ${id('panel-' + index)} ${ref('aria-labelledby', 'tab-' + index)} ${react ? 'tabIndex={0}' : 'tabindex="0"'}${plain ? (index ? ' hidden' : '') : ' ' + attr('hidden', `active !== ${index}`)}>${label}</div>`,
        )
        .join('\n')
      markup = `<div role="tablist" aria-label="${escapeHTML(component.name)}"${listener}>\n${buttons}\n</div>\n${panels}`
      break
    }
  }
  markup = formatMarkup(`<div ${classes(scope)}>${markup}</div>`)
  // User strings are only data: template-language delimiters never enter templates.
  if (!plain && kind === 'tabs')
    markup = markup.replace(
      `aria-label="${escapeHTML(component.name)}"`,
      'aria-label="Component tabs"',
    )
  const declarations = Object.entries(componentStyle(component.style))
    .map(([key, value]) => `  ${key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}: ${value};`)
    .join('\n')
  const scoped = (css: string) => css.replaceAll('$', '.' + scope)
  const foundation = `.${scope} { font-family: ${fontFamily(system.font)}; max-width: 100%; }\n.${scope} *, .${scope} *::before, .${scope} *::after { box-sizing: border-box; }\n.${scope} .piece {\n${declarations}\n  font-family: inherit;\n  line-height: 1.4;\n  max-width: 100%;\n  overflow-wrap: anywhere;\n}\n`
  const common = scoped(
    `$ button, $ input, $ textarea, $ select { font-family: inherit; }\n$ button { cursor: pointer; }\n$ :focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }\n$ :disabled { opacity: 0.45; cursor: not-allowed; }\n$ svg { flex-shrink: 0; vertical-align: middle; }\n`,
  )
  const extras: Record<SavedComponent['kind'], string> = {
    button:
      '$ .piece { display: inline-flex; align-items: center; justify-content: center; gap: 12px; }',
    badge: '$ .piece { display: inline-flex; align-items: center; justify-content: center; }',
    input: '',
    textarea: '$ textarea { resize: vertical; }',
    select: '',
    card: `$ article { width: 290px; }\n$ h3 { font-family: ${fontFamily(system.headingFont)}; font-size: 1.4em; margin: 24px 0 8px; }\n$ p { font-size: 0.85em; line-height: 1.6; margin: 8px 0 18px; }`,
    alert:
      '$ .piece { display: flex; align-items: flex-start; gap: 14px; width: 340px; }\n$ p { font-size: 0.85em; line-height: 1.6; margin: 4px 0 0; }',
    switch:
      '$ .piece { display: flex; min-width: 66px; }\n$ .thumb { display: block; width: 18px; height: 18px; border-radius: 50%; background: currentColor; transform: translateX(-6px); }\n$ input:checked + .piece .thumb { margin-left: auto; transform: translateX(6px); }',
    checkbox:
      '$ .piece { display: flex; align-items: center; justify-content: center; }\n$ input:not(:checked) + .piece svg { visibility: hidden; }',
    tabs: '$ [role="tablist"] { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }\n$ [role="tab"][aria-selected="false"] { border: 0; padding: 12px; background: transparent; color: inherit; font-size: 12px; box-shadow: none; }\n$ [role="tabpanel"] { margin-top: 24px; font-size: 12px; text-align: center; }\n$ [hidden] { display: none; }',
    tooltip:
      '$ .tooltip-wrap { display: inline-flex; position: relative; padding-top: 12px; }\n$ .tooltip-wrap > button { border: 0; background: transparent; color: inherit; font-size: 13px; padding: 8px; }\n$ [role="tooltip"] { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); width: max-content; max-width: min(280px, 80vw); text-align: center; visibility: hidden; z-index: 1; }\n$ .tooltip-wrap:hover [role="tooltip"], $ .tooltip-wrap:focus-within [role="tooltip"] { visibility: visible; }\n$ [role="tooltip"]::after { content: ""; position: absolute; left: calc(50% - 5px); bottom: -5px; width: 10px; height: 10px; background: inherit; transform: rotate(45deg); }',
    progress:
      '$ .progress { width: 100%; border-radius: 4px; background: #8793a726; }\n$ .progress .piece { width: 64%; min-height: 12px; }',
  }
  const fieldCSS = ['input', 'textarea', 'select', 'progress'].includes(kind)
    ? scoped(
        '$ .field { display: grid; gap: 10px; width: min(100%, 320px); font-size: 12px; }\n$ .field > span { display: flex; justify-content: space-between; gap: 8px; }\n$ input, $ textarea, $ select { width: 100%; min-width: 0; }\n',
      )
    : ''
  const checkCSS = ['switch', 'checkbox'].includes(kind)
    ? scoped(
        '$ .check-label { display: inline-flex; align-items: center; gap: 12px; position: relative; font-size: 13px; cursor: pointer; }\n$ input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }\n$ input:focus-visible + .piece { outline: 2px solid currentColor; outline-offset: 4px; }\n$ input:disabled + .piece { opacity: 0.45; cursor: not-allowed; }\n',
      )
    : ''
  const stylesheet = fontStylesheet(
    kind === 'card' ? [system.font, system.headingFont] : [system.font],
  )
  const css =
    `${stylesheet ? `@import url("${stylesheet}");\n\n` : ''}${foundation}${common}${fieldCSS}${checkCSS}${scoped(extras[kind])}\n`
      .replaceAll('{ ', '{\n  ')
      .replaceAll('; ', ';\n  ')
      .replaceAll(' }', '\n}')
      .replace(/\n[ \t]+\n}/g, '\n}')
  const keyboardBody = (state: string, update: string) =>
    `if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;\nevent.preventDefault();\nconst buttons = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]'));\nif (buttons.every(button => button.disabled)) return;\nconst next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (${state} + (event.key === 'ArrowRight' ? 1 : 2)) % 3;\n${update}\nbuttons[next]?.focus();`
  const needsId = kind === 'tabs' || kind === 'tooltip'
  if (plain) {
    const script =
      kind === 'tabs'
        ? `document.querySelectorAll('.${scope}').forEach(root => {\n  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));\n  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));\n  const id = 'tabs-' + crypto.randomUUID();\n  tabs.forEach((tab, index) => {\n    tab.id = id + '-tab-' + index;\n    panels[index].id = id + '-panel-' + index;\n    tab.setAttribute('aria-controls', panels[index].id);\n    panels[index].setAttribute('aria-labelledby', tab.id);\n  });\n  function select(index) {\n    if (tabs[index].disabled) return;\n    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });\n  }\n  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));\n  root.querySelector('[role="tablist"]').addEventListener('keydown', event => {\n    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;\n    event.preventDefault();\n    const active = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');\n    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (active + (event.key === 'ArrowRight' ? 1 : 2)) % 3;\n    select(next); tabs[next].focus();\n  });\n});\n`
        : ''
    return [
      {
        name: file + '.html',
        language: 'html',
        content: `<link rel="stylesheet" href="./${file}.css" />\n\n${markup}\n${script ? `\n<script src="./${file}.js" defer></script>\n` : ''}`,
      },
      { name: file + '.css', language: 'css', content: css },
      ...(script ? [{ name: file + '.js', language: 'javascript', content: script }] : []),
    ]
  }
  if (react) {
    const imports =
      kind === 'tabs'
        ? "import { useId, useState, type KeyboardEvent } from 'react';\n"
        : needsId
          ? "import { useId } from 'react';\n"
          : ''
    const content = `${imports}import './${file}.css';\n\nexport default function ${name}(${editable.has(kind) ? `{ disabled = ${disabled} }: { disabled?: boolean } = {}` : ''}) {\n  const label = ${literal(component.label)};\n${needsId ? '  const id = useId();\n' : ''}${kind === 'tabs' ? `  const [active, setActive] = useState(0);\n  function handleKey(event: KeyboardEvent<HTMLDivElement>) {\n${indent(keyboardBody('active', 'setActive(next);'), 4)}\n  }\n` : ''}  return (\n${indent(markup, 4)}\n  );\n}\n`
    return [
      { name: name + '.tsx', language: 'tsx', content },
      { name: file + '.css', language: 'css', content: css },
    ]
  }
  if (vue) {
    const content = `<script setup lang="ts">\n${needsId ? `import { ${kind === 'tabs' ? 'ref, ' : ''}useId } from 'vue';\nconst id = useId();\n` : ''}const label = ${literal(component.label)};\n${editable.has(kind) ? `withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: ${disabled} });\n` : ''}${kind === 'tabs' ? `const active = ref(0);\nfunction handleKey(event: KeyboardEvent) {\n${indent(keyboardBody('active.value', 'active.value = next;'))}\n}\n` : ''}</script>\n\n<template>\n${indent(markup)}\n</template>\n\n<style scoped>\n${css}</style>\n`
    return [{ name: name + '.vue', language: 'vue', content }]
  }
  const content = `import { Component${editable.has(kind) ? ', Input' : ''} } from '@angular/core';\n\n@Component({\n  selector: 'app-${file}',\n  standalone: true,\n  templateUrl: './${file}.component.html',\n  styleUrl: './${file}.component.css',\n})\nexport class ${name}Component {\n  readonly label = ${literal(component.label)};\n${editable.has(kind) ? `  @Input() disabled = ${disabled};\n` : ''}${needsId ? `  private static nextId = 0;\n  readonly id = '${scope}-' + ${name}Component.nextId++;\n` : ''}${kind === 'tabs' ? `  active = 0;\n  handleKey(event: KeyboardEvent) {\n${indent(keyboardBody('this.active', 'this.active = next;'), 4)}\n  }\n` : ''}}\n`
  return [
    { name: file + '.component.ts', language: 'typescript', content },
    { name: file + '.component.html', language: 'html', content: markup + '\n' },
    { name: file + '.component.css', language: 'css', content: css },
  ]
}
