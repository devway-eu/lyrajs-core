/**
 * JSX Runtime Module Exports
 * Public API for JSX/TSX templates in LyraJS
 */

// Core JSX runtime
export { h, jsx, jsxs, jsxDEV, Fragment, escape, renderProps, SafeHTML, SAFE_HTML_BRAND, rawHtml, isSafeHTML } from './runtime'
export type { JSXElement, Props, Component } from './runtime'

// Async component utilities
export {
  resolveAsync,
  AsyncComponent,
  ErrorBoundary,
  renderParallel,
  renderSequential
} from './async'

// Compiler (for advanced use cases)
export { TsxCompiler } from './compiler'
export type { CompilerOptions } from './compiler'

// Types (imported globally, but re-exported for convenience)
export type {} from './types'
