/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getStorageUrl } from '../lib/api.js'

/** Lets the loading overlay show the last known logo & site name before the next /api/site-settings response. */
export const SITE_LOGO_STORAGE_KEY = 'peerbridge_logo_url'
export const SITE_NAME_STORAGE_KEY = 'peerbridge_site_name'

const SiteSettingsContext = createContext({
  settings: null,
  loading: true,
  error: null,
})

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await api.get('/api/site-settings')
        if (cancelled) {
          return
        }
        const resolvedData = {
          ...data,
          logo_url: data.logo_url ? getStorageUrl(data.logo_url) : data.logo_url,
          favicon_url: data.favicon_url ? getStorageUrl(data.favicon_url) : data.favicon_url
        }
        setSettings(resolvedData)
        if (resolvedData.logo_url) {
          try {
            sessionStorage.setItem(SITE_LOGO_STORAGE_KEY, resolvedData.logo_url)
          } catch {
            /* ignore quota / private mode */
          }
        }
        if (resolvedData.site_name) {
          const siteName = ['peerbridge', 'peerbridge delivery', 'preebridge'].includes(resolvedData.site_name.trim().toLowerCase())
            ? 'Shantasra'
            : resolvedData.site_name;
          resolvedData.site_name = siteName;
          document.title = siteName
          try {
            sessionStorage.setItem(SITE_NAME_STORAGE_KEY, resolvedData.site_name)
          } catch {
            /* ignore quota / private mode */
          }
        }
        if (resolvedData.favicon_url) {
          let link = document.querySelector("link[rel='icon']")
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = resolvedData.favicon_url
        }
        let meta = document.querySelector('meta[name="description"]')
        if (!meta) {
          meta = document.createElement('meta')
          meta.name = 'description'
          document.head.appendChild(meta)
        }
        if (data.site_description) {
          meta.content = data.site_description
        }
        // Defer clearing "loading" so the overlay can paint one frame with settings (e.g. logo_url)
        // before both site + auth complete; avoids batched setSettings + setLoading(false) hiding the logo.
        setTimeout(() => {
          if (!cancelled) {
            setLoading(false)
          }
        }, 0)
      } catch (e) {
        if (!cancelled) {
          setError(e)
        }
        setTimeout(() => {
          if (!cancelled) {
            setLoading(false)
          }
        }, 0)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => ({ settings, loading, error }), [settings, loading, error])

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
