import { describe, expect, it } from 'vitest'
import ts from 'typescript'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc'
import { parseTemplate } from '@angular/compiler'
import { parseHTML } from 'linkedom'
import { runInNewContext } from 'node:vm'
import { resolve } from 'node:path'
import { componentCode, codeFormats } from './componentCode'
import { componentKinds, makeComponent } from './builder'
import { defaultSystem } from './system'

const components = componentKinds.map((kind) => makeComponent(kind, defaultSystem))

describe('component code generation', () => {
  it('generates compilable Vue templates and styles for every component', () => {
    for (const component of components) {
      const file = componentCode(component, defaultSystem, 'Vue')[0]!
      const { descriptor, errors } = parse(file.content, { filename: file.name })
      expect(errors, component.kind).toEqual([])
      const script = compileScript(descriptor, { id: component.id })
      const template = compileTemplate({
        source: descriptor.template!.content,
        filename: file.name,
        id: component.id,
        compilerOptions: { bindingMetadata: script.bindings },
      })
      expect(template.errors, component.kind).toEqual([])
      expect(
        compileStyle({
          source: descriptor.styles[0]!.content,
          filename: file.name,
          id: component.id,
          scoped: true,
        }).errors,
        component.kind,
      ).toEqual([])
    }
  })

  it('type-checks every generated React component against React types', () => {
    const sources = new Map(
      components.map((component) => {
        const file = componentCode(component, defaultSystem, 'React')[0]!
        return [resolve('src/__generated__', file.name), file.content] as const
      }),
    )
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: ['react'],
    }
    const host = ts.createCompilerHost(options)
    const read = host.getSourceFile.bind(host)
    host.getSourceFile = (file, language, onError) =>
      sources.has(file)
        ? ts.createSourceFile(
            file,
            sources.get(file)!,
            ts.ScriptTarget.ES2022,
            true,
            ts.ScriptKind.TSX,
          )
        : read(file, language, onError)
    const program = ts.createProgram([...sources.keys()], options, host)
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([])
  })

  it('parses every Angular template and its TypeScript class', () => {
    for (const component of components) {
      const files = componentCode(component, defaultSystem, 'Angular')
      const template = files.find((file) => file.name.endsWith('.html'))!
      expect(parseTemplate(template.content, template.name).errors, component.kind).toBeNull()
      const source = files[0]!
      const result = ts.transpileModule(source.content, {
        compilerOptions: { experimentalDecorators: true, target: ts.ScriptTarget.ES2022 },
        reportDiagnostics: true,
      })
      expect(result.diagnostics, component.kind).toEqual([])
      expect(source.content).toContain(`templateUrl: './${template.name}'`)
      expect(source.content).toContain(`styleUrl: './${files[2]!.name}'`)
    }
  })

  it('exports the resolved linked appearance, current label, fonts, and disabled default', () => {
    const source = makeComponent('button', defaultSystem)
    source.style.topLeft = 39
    source.style.paddingX = 31
    const child = {
      ...makeComponent('button', defaultSystem),
      linkedTo: source.id,
      label: 'Continue',
    }
    child.style.background = '#abcdef'
    const system = { ...defaultSystem, font: 'Inter' as const, components: [source, child] }
    for (const format of codeFormats) {
      const code = componentCode(child, system, format, true)
        .map((file) => file.content)
        .join('\n')
      expect(code).toContain('border-radius: 39px')
      expect(code).toContain('padding: 12px 31px')
      expect(code).toContain('background: #abcdef')
      expect(code).toContain('Inter')
      expect(code).toContain('Continue')
      expect(code).toContain(
        format === 'Plain' ? ' disabled' : format === 'Vue' ? 'disabled: true' : 'disabled = true',
      )
    }
    child.style.background = '#123456'
    expect(componentCode(child, system, 'Plain')[1]!.content).toContain('#123456')
  })

  it('keeps edited text as data instead of executable markup or template expressions', () => {
    const component = {
      ...makeComponent('tabs', defaultSystem),
      name: '123 </script> {{ danger() }}',
      label: '</script><img src=x onerror=alert(1)> {{ danger() }} `${injected}`',
    }
    const plain = componentCode(component, defaultSystem, 'Plain')[0]!.content
    expect(plain).not.toContain('<img')
    expect(plain).toContain('&lt;img')
    for (const format of ['React', 'Vue', 'Angular'] as const) {
      const files = componentCode(component, defaultSystem, format)
      expect(files[0]!.content).toContain('\\u003c/script\\u003e')
      expect(files.every((file) => /^[a-z0-9.-]+$/i.test(file.name))).toBe(true)
      if (format === 'Vue') {
        const parsed = parse(files[0]!.content)
        expect(parsed.errors).toEqual([])
        expect(parsed.descriptor.template!.content).not.toContain('danger()')
        expect(() => compileScript(parsed.descriptor, { id: 'safe' })).not.toThrow()
      }
      if (format === 'Angular') expect(files[1]!.content).not.toContain('danger()')
    }
  })

  it('wires plain tabs with independent instance IDs, selection, and arrow-key navigation', () => {
    const files = componentCode(makeComponent('tabs', defaultSystem), defaultSystem, 'Plain')
    const { document, Event } = parseHTML(
      `<html><body>${files[0]!.content}${files[0]!.content}</body></html>`,
    )
    runInNewContext(files[2]!.content, { document, crypto })
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    const panels = [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')]
    expect(new Set(tabs.map((tab) => tab.id)).size).toBe(6)
    tabs[1]!.click()
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true')
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('false')
    expect(tabs[3]!.getAttribute('aria-selected')).toBe('true')
    expect(panels[0]!.hidden).toBe(true)
    expect(panels[1]!.hidden).toBe(false)
    const event = new Event('keydown', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'key', { value: 'End' })
    tabs[1]!.dispatchEvent(event)
    expect(tabs[2]!.getAttribute('aria-selected')).toBe('true')
    expect(tabs[2]!.getAttribute('aria-controls')).toBe(panels[2]!.id)
    expect(panels[2]!.getAttribute('aria-labelledby')).toBe(tabs[2]!.id)
  })

  it('preserves native form semantics and avoids empty font imports', () => {
    for (const kind of ['switch', 'checkbox'] as const) {
      const code = componentCode(
        makeComponent(kind, defaultSystem),
        defaultSystem,
        'Plain',
        true,
      )[0]!.content
      const { document } = parseHTML(code)
      const input = document.querySelector('label input')!
      expect(input.getAttribute('type')).toBe('checkbox')
      expect(input.hasAttribute('disabled')).toBe(true)
      expect(input.hasAttribute('checked')).toBe(true)
    }
    expect(
      componentCode(components[0]!, { ...defaultSystem, font: 'system-ui' }, 'Plain')[1]!.content,
    ).not.toContain('@import')
  })
})
