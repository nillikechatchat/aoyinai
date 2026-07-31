import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000'
const outputDirectory = resolve('.monkeycode/visual-regression')
const pages = [
  { name: 'home', path: '/' },
  { name: 'explore', path: '/explore' },
  { name: 'article', path: '/blog/ai-dynamics-july-29-2026' },
]
const viewports = [
  { name: 'desktop', size: '1440,900' },
  { name: 'mobile', size: '390,844' },
]

mkdirSync(outputDirectory, { recursive: true })

for (const page of pages) {
  for (const viewport of viewports) {
    execFileSync('playwright', [
      'screenshot',
      `--viewport-size=${viewport.size}`,
      '--full-page',
      new URL(page.path, baseUrl).toString(),
      resolve(outputDirectory, `${page.name}-${viewport.name}.png`),
    ], { stdio: 'inherit' })
  }
}
