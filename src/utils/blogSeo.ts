import { useEffect } from 'react'

interface PageSeo {
  title: string
  description?: string
  canonical?: string
  robots?: string
  image?: string
  jsonLd?: Record<string, unknown> | null
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageSeo({ title, description, canonical, robots, image, jsonLd }: PageSeo) {
  const json = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    document.title = title
    if (description) upsertMeta('name', 'description', description)
    if (robots) upsertMeta('name', 'robots', robots)
    if (description) upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:title', title)
    if (image) upsertMeta('property', 'og:image', image)
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = canonical
    }
    let script = document.getElementById('blog-jsonld')
    if (json) {
      if (!script) {
        script = document.createElement('script')
        script.id = 'blog-jsonld'
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = json
    } else if (script) {
      script.remove()
    }
    return () => {
      document.getElementById('blog-jsonld')?.remove()
    }
  }, [title, description, canonical, robots, image, json])
}

export function absoluteUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}
