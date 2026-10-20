import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BACKDROPS } from '../../app/backdrops'
import { DEFAULT_THEME, THEMES, isThemeId } from '../../app/themes'

const css = (path: string) => readFileSync(resolve('app/assets/css', path), 'utf8')

// A theme is an entry in app/themes/index.ts plus its CSS file. These catch a half-added one.
describe('themes', () => {
  it('has unique ids and a valid default', () => {
    const ids = THEMES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(isThemeId(DEFAULT_THEME)).toBe(true)
  })

  for (const theme of THEMES) {
    it(`${theme.id} has a stylesheet that main.css loads`, () => {
      const file = `themes/${theme.id}.css`
      expect(existsSync(resolve('app/assets/css', file))).toBe(true)
      expect(css(file)).toContain(`[data-theme='${theme.id}']`)
      expect(css('main.css')).toContain(`@import './${file}';`)
    })

    it(`${theme.id} uses a backdrop that exists`, () => {
      const { backdrop } = theme.effects
      expect(backdrop === null || backdrop in BACKDROPS).toBe(true)
    })
  }

  it('rejects unknown ids', () => {
    expect(isThemeId('nope')).toBe(false)
    expect(isThemeId(undefined)).toBe(false)
  })
})
