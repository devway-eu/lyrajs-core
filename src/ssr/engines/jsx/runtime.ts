/**
 * JSX Runtime for LyraJS
 * Provides core h() function, Fragment support, and HTML rendering
 */

/**
 * JSX Element type - can be a string (HTML), Promise<string> for async components, or array of elements
 */
export type JSXElement = string | Promise<string> | JSXElement[]

/**
 * Fragment symbol for grouping elements without a wrapper
 */
export const Fragment = Symbol.for('jsx.fragment')

/**
 * Props type - any object with string keys
 */
export interface Props {
  [key: string]: any
}

/**
 * Component function type - can be sync or async
 */
export type Component<P = Props> = (props: P) => JSXElement | JSXElement[]

/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escape(text: any): string {
  if (text === null || text === undefined) {
    return ''
  }

  const str = String(text)
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char])
}

/**
 * Render props/attributes to HTML string
 */
export function renderProps(props: Props | null): string {
  if (!props) return ''

  const attributes: string[] = []

  for (const [key, value] of Object.entries(props)) {
    // Skip special props
    if (key === 'children' || key === 'key' || key === 'ref') {
      continue
    }

    // Handle boolean attributes
    if (typeof value === 'boolean') {
      if (value) {
        attributes.push(key)
      }
      continue
    }

    // Handle className -> class
    const attrName = key === 'className' ? 'class' : key

    // Handle style object
    if (key === 'style' && typeof value === 'object') {
      const styleStr = Object.entries(value)
        .map(([k, v]) => {
          // Convert camelCase to kebab-case
          const kebab = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
          return `${kebab}:${v}`
        })
        .join(';')
      attributes.push(`style="${escape(styleStr)}"`)
      continue
    }

    // Handle event handlers (skip in SSR)
    if (key.startsWith('on')) {
      continue
    }

    // Regular attributes
    attributes.push(`${attrName}="${escape(value)}"`)
  }

  return attributes.length > 0 ? ' ' + attributes.join(' ') : ''
}

/**
 * Self-closing HTML tags
 */
const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

/**
 * Flatten children array (handles nested arrays)
 */
function flattenChildren(children: any[]): any[] {
  const result: any[] = []

  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child))
    } else if (child !== null && child !== undefined && child !== false) {
      result.push(child)
    }
  }

  return result
}

/**
 * Core JSX factory function
 * Creates HTML elements from JSX syntax
 *
 * @param tag - HTML tag name or Component function
 * @param props - Element properties/attributes
 * @param children - Child elements
 * @returns HTML string or Promise<string> for async components
 */
export function h(
  tag: string | Component | symbol,
  props: Props | null,
  ...children: any[]
): JSXElement {
  // Handle Fragment
  if (tag === Fragment) {
    const flatChildren = flattenChildren(children)
    if (flatChildren.some((child) => child instanceof Promise)) {
      return Promise.all(flatChildren).then((resolved) => resolved.join(''))
    }
    return flatChildren.join('')
  }

  // Handle Component functions
  if (typeof tag === 'function') {
    const componentProps = { ...props, children: children.length === 1 ? children[0] : children }
    const result = tag(componentProps)

    // If component returns a Promise, handle it
    if (result instanceof Promise) {
      return result
    }

    // If component returns an array, join it
    if (Array.isArray(result)) {
      const flatResult = flattenChildren(result)
      if (flatResult.some((child) => child instanceof Promise)) {
        return Promise.all(flatResult).then((resolved) => resolved.join(''))
      }
      return flatResult.join('')
    }

    return result
  }

  // Handle HTML elements (string tags)
  if (typeof tag === 'string') {
    const flatChildren = flattenChildren(children)
    const hasAsyncChildren = flatChildren.some((child) => child instanceof Promise)

    // Self-closing tags
    if (SELF_CLOSING_TAGS.has(tag)) {
      return `<${tag}${renderProps(props)} />`
    }

    // If we have async children, return a Promise
    if (hasAsyncChildren) {
      return Promise.all(flatChildren).then((resolvedChildren) => {
        const childrenHtml = resolvedChildren.map((child) => {
          if (typeof child === 'string') return child
          if (typeof child === 'number') return String(child)
          return escape(child)
        }).join('')

        return `<${tag}${renderProps(props)}>${childrenHtml}</${tag}>`
      })
    }

    // Synchronous rendering
    const childrenHtml = flatChildren.map((child) => {
      if (typeof child === 'string') return child
      if (typeof child === 'number') return String(child)
      return escape(child)
    }).join('')

    return `<${tag}${renderProps(props)}>${childrenHtml}</${tag}>`
  }

  throw new Error(`Invalid JSX tag type: ${typeof tag}`)
}

/**
 * JSX factory for TypeScript (alternative name)
 */
export const jsx = h
export const jsxs = h
export const jsxDEV = h
