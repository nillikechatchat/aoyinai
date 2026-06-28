// @ts-check
import AstroPureIntegration from 'astro-pure'
import { defineConfig, fontProviders } from 'astro/config'
import config from './src/site.config.ts'

// https://astro.build/config
export default defineConfig({
  // [Basic]
  site: 'https://aoyinai.vercel.app',
  trailingSlash: 'never',
  server: { host: true },
  prefetch: { defaultStrategy: 'viewport' },

  // [Adapter] - 静态部署给 Vercel
  output: 'static',

  // [Assets]
  image: {
    responsiveStyles: true,
    remotePatterns: [{ protocol: 'https' }]
  },

  // [Markdown]
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' }
    }
  },

  // [Integrations]
  integrations: [AstroPureIntegration(config)],

  // [Experimental]
  experimental: {
    contentIntellisense: true,
    fonts: [
      {
        provider: fontProviders.fontshare(),
        name: 'Satoshi',
        cssVariable: '--font-satoshi',
        styles: ['normal', 'italic'],
        weights: [400, 500],
        subsets: ['latin']
      }
    ]
  },

  // [Vite]
  vite: {
    server: {
      allowedHosts: ['.monkeycode-ai.online']
    }
  }
})
