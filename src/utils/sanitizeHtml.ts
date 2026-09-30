const ALLOWED = new Set(['P', 'BR', 'UL', 'OL', 'LI', 'A', 'IMG', 'STRONG', 'EM', 'B', 'I', 'H2', 'H3', 'BLOCKQUOTE'])
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META'])

function safeUrl(value: string, allowMailto: boolean) {
  const trimmed = value.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const url = new URL(trimmed)
    if (url.protocol === 'http:' || url.protocol === 'https:') return true
    if (allowMailto && url.protocol === 'mailto:') return true
  } catch {
    return false
  }
  return false
}

function clean(node: Node) {
  const children = [...node.childNodes]
  for (const child of children) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue
    const element = child as HTMLElement
    if (DROP.has(element.tagName)) {
      element.remove()
      continue
    }
    if (!ALLOWED.has(element.tagName)) {
      const moved = [...element.childNodes]
      for (const item of moved) element.parentNode?.insertBefore(item, element)
      element.remove()
      for (const item of moved) clean(item)
      continue
    }
    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || ''
      ;[...element.attributes].forEach((attr) => element.removeAttribute(attr.name))
      if (safeUrl(href, true)) element.setAttribute('href', href.trim())
      element.setAttribute('rel', 'noopener noreferrer')
    } else if (element.tagName === 'IMG') {
      const src = element.getAttribute('src') || ''
      const alt = element.getAttribute('alt') || ''
      if (!safeUrl(src, false)) {
        element.remove()
        continue
      }
      ;[...element.attributes].forEach((attr) => element.removeAttribute(attr.name))
      element.setAttribute('src', src.trim())
      element.setAttribute('alt', alt)
    } else {
      ;[...element.attributes].forEach((attr) => element.removeAttribute(attr.name))
    }
    clean(element)
  }
}

export function sanitizeHtml(html: string) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  clean(doc.body)
  return doc.body.innerHTML
}
