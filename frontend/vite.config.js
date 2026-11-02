import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import http from 'node:http'
import https from 'node:https'
import vm from 'node:vm'

let cachedCookie = ''
let cookieFetching = null

function fetchByethostCookie(domain) {
  if (cookieFetching) return cookieFetching

  cookieFetching = new Promise((resolve) => {
    http.get(`http://${domain}/aes.js`, (res) => {
      let aesJs = ''
      res.on('data', d => { aesJs += d })
      res.on('end', () => {
        function solve(url, currentCookie) {
          const u = new URL(url)
          https.get({
            hostname: u.hostname,
            path: u.pathname + u.search,
            headers: {
              'Cookie': currentCookie || '',
              'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          }, (res2) => {
            let html = ''
            res2.on('data', d => { html += d })
            res2.on('end', () => {
              if (html.includes('aes.js')) {
                const sandbox = { document: { cookie: '' }, location: { href: '' } }
                const match = html.match(/<script>(.*?)<\/script>/s)
                if (!match) {
                  cookieFetching = null
                  return resolve(currentCookie || '')
                }
                vm.runInNewContext(aesJs + ';' + match[1], sandbox)
                const cookie = sandbox.document.cookie.split(';')[0]
                const nextUrl = sandbox.location.href.replace('http:', 'https:')
                solve(nextUrl, cookie)
              } else {
                cachedCookie = currentCookie || ''
                cookieFetching = null
                resolve(cachedCookie)
              }
            })
          }).on('error', () => {
            cookieFetching = null
            resolve(currentCookie || '')
          })
        }
        solve(`https://${domain}/`, '')
      })
    }).on('error', () => {
      cookieFetching = null
      resolve('')
    })
  })

  return cookieFetching
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_PROXY_TARGET || env.VITE_API_URL || 'https://yareddebela.byethost22.com'
  const isByethost = apiUrl.includes('byethost')
  const byethostDomain = isByethost ? new URL(apiUrl).hostname : ''

  if (isByethost) {
    fetchByethostCookie(byethostDomain)
  }

  const configureProxy = (proxy) => {
    if (isByethost) {
      proxy.on('proxyReq', (proxyReq) => {
        if (cachedCookie) {
          const current = proxyReq.getHeader('cookie') || ''
          proxyReq.setHeader('cookie', current ? `${current}; ${cachedCookie}` : cachedCookie)
        }
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      })
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'byethost-auth-init',
        configureServer() {
          if (isByethost) {
            fetchByethostCookie(byethostDomain)
          }
        }
      }
    ],
    build: {
      outDir: '../backend/public/frontend-build',
      emptyOutDir: true,
      manifest: 'manifest.json',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
              return 'react';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          headers: {
            Accept: 'application/json',
          },
          configure: configureProxy,
        },
        '/sanctum': {
          target: apiUrl,
          changeOrigin: true,
          configure: configureProxy,
        },
        '/storage': {
          target: apiUrl,
          changeOrigin: true,
          configure: configureProxy,
        },
      },
    },
  }
})
