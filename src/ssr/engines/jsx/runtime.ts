/**
 * JSX Runtime for LyraJS
 * Provides core h() function, Fragment support, and HTML rendering
 */

/**
 * JSX Element type - can be a string (HTML), Promise<string> for async components, or array of elements
 */
export type JSXElement = string | SafeHTML | Promise<string | SafeHTML> | JSXElement[]

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
 * Global brand symbol for SafeHTML.
 * Uses Symbol.for so it is shared across module boundaries
 * (inlined runtime in compiled templates vs. package import).
 */
export const SAFE_HTML_BRAND = Symbol.for('lyra.safehtml')

/**
 * Wrapper that marks a string as already-escaped HTML.
 * h() returns SafeHTML for every rendered element; plain strings
 * passed as {expression} children are escaped automatically.
 * Use rawHtml() when you intentionally need to bypass escaping.
 */
export class SafeHTML {
  readonly html: string

  constructor(html: string) {
    this.html = html
    Object.defineProperty(this, SAFE_HTML_BRAND, { value: true })
  }

  toString(): string {
    return this.html
  }
}

/**
 * Check whether a value is a SafeHTML instance.
 * Works across module boundaries because it checks the shared symbol brand.
 */
export function isSafeHTML(value: any): value is SafeHTML {
  return value != null && typeof value === 'object' && SAFE_HTML_BRAND in value
}

/**
 * Mark a string as trusted HTML that should NOT be escaped.
 * Only use with content you fully trust (e.g. output from a
 * sanitization library, or static markup you control).
 *
 * @example
 *   <div>{rawHtml(sanitizedContent)}</div>
 */
export function rawHtml(html: string): SafeHTML {
  return new SafeHTML(String(html))
}

/**
 * Render a single child value to an HTML string.
 * SafeHTML (output of h() or rawHtml()) passes through unchanged;
 * plain strings are escaped.
 */
function renderChild(child: any): string {
  if (isSafeHTML(child)) return child.html
  if (typeof child === 'string') return escape(child)
  if (typeof child === 'number') return String(child)
  return escape(child)
}

/**
 * Render props/attributes to HTML string
 */
export function renderProps(props: Props | null): string {
  if (!props) return ''

  const attributes: string[] = []

  for (const [key, value] of Object.entries(props)) {
    // Skip special props
    if (key === 'children' || key === 'key' || key === 'ref' || key === 'dangerouslySetInnerHTML') {
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
 * Creates HTML elements from JSX syntax.
 * All string children are HTML-escaped automatically.
 * Use rawHtml() to opt a specific value out of escaping, or
 * dangerouslySetInnerHTML={{ __html }} as a React-compatible alternative.
 *
 * @param tag - HTML tag name or Component function
 * @param props - Element properties/attributes
 * @param children - Child elements
 * @returns SafeHTML or Promise<SafeHTML> for async components
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
      return Promise.all(flatChildren).then((resolved) => new SafeHTML(resolved.map(renderChild).join('')))
    }
    return new SafeHTML(flatChildren.map(renderChild).join(''))
  }

  // Handle Component functions
  if (typeof tag === 'function') {
    const componentProps = { ...props, children: children.length === 1 ? children[0] : children }
    const result = tag(componentProps)

    // Promise: passes through, resolves to SafeHTML
    if (result instanceof Promise) {
      return result
    }

    // Array: render each child through renderChild
    if (Array.isArray(result)) {
      const flatResult = flattenChildren(result)
      if (flatResult.some((child) => child instanceof Promise)) {
        return Promise.all(flatResult).then((resolved) => new SafeHTML(resolved.map(renderChild).join('')))
      }
      return new SafeHTML(flatResult.map(renderChild).join(''))
    }

    return result
  }

  // Handle HTML elements (string tags)
  if (typeof tag === 'string') {
    const flatChildren = flattenChildren(children)
    const hasAsyncChildren = flatChildren.some((child) => child instanceof Promise)

    // Self-closing tags have no children or innerHTML
    if (SELF_CLOSING_TAGS.has(tag)) {
      return new SafeHTML(`<${tag}${renderProps(props)} />`)
    }

    // dangerouslySetInnerHTML: inject raw HTML without escaping
    if (props && props.dangerouslySetInnerHTML) {
      return new SafeHTML(`<${tag}${renderProps(props)}>${props.dangerouslySetInnerHTML.__html}</${tag}>`)
    }

    // Async children: await all promises then render
    if (hasAsyncChildren) {
      return Promise.all(flatChildren).then((resolvedChildren) => {
        return new SafeHTML(`<${tag}${renderProps(props)}>${resolvedChildren.map(renderChild).join('')}</${tag}>`)
      })
    }

    // Synchronous rendering
    return new SafeHTML(`<${tag}${renderProps(props)}>${flatChildren.map(renderChild).join('')}</${tag}>`)
  }

  throw new Error(`Invalid JSX tag type: ${typeof tag}`)
}

/**
 * JSX factory for TypeScript (alternative name)
 */
export const jsx = h
export const jsxs = h
export const jsxDEV = h
