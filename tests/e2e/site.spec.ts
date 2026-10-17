import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = ['/', '/projects', '/projects/dashboard-grid', '/projects/tennistracker', '/resume']

test.describe('pages', () => {
  // Check colors at rest, not halfway through a fade-in
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  for (const path of PAGES) {
    test(`${path} renders without errors or accessibility violations`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))

      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1').first()).toBeVisible()

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
      expect(errors).toEqual([])
    })
  }

  test('unknown pages return 404', async ({ page }) => {
    const response = await page.goto('/projects/does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('404', { exact: true })).toBeVisible()
  })
})

test('home links through to a project case study', async ({ page }) => {
  await page.goto('/')
  await page
    .locator('#projects')
    .getByRole('link', { name: /Custom Dashboard Grid/ })
    .click()
  await expect(page).toHaveURL(/\/projects\/dashboard-grid$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Custom Dashboard Grid')
})

test('contact form checks fields before sending', async ({ page }) => {
  await page.goto('/#contact')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Please add your name.')).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
})

test.describe('server', () => {
  test('health check', async ({ request }) => {
    const res = await request.get('/healthz')
    expect(await res.json()).toMatchObject({ ok: true })
  })

  test('www redirects to the canonical host', async ({ request }) => {
    const res = await request.get('/projects?x=1', { headers: { 'x-forwarded-host': 'www.benduffaut.com' }, maxRedirects: 0 })
    expect(res.status()).toBe(301)
    expect(res.headers().location).toBe('https://benduffaut.com/projects?x=1')
  })

  test('contact API rejects invalid input', async ({ request }) => {
    const res = await request.post('/api/contact', { data: { name: '', email: 'x', message: '' } })
    expect(res.status()).toBe(422)
  })

  test('sitemap lists the projects', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text()
    expect(body).toContain('/projects/tennistracker')
  })

  test('resume PDF is served', async ({ request }) => {
    const res = await request.get('/resume.pdf')
    test.skip(res.status() === 404 && !process.env.CI, 'Run npm run assets first')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toBe('application/pdf')
  })
})
