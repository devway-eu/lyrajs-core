/**
 * TSX/JSX Runtime Compiler for LyraJS
 * Uses esbuild to compile TypeScript/JSX at runtime with caching
 */

import * as fs from 'fs'
import * as path from 'path'
import { createRequire } from 'module'
import { transformSync } from 'esbuild'

/**
 * Compiler options
 */
export interface CompilerOptions {
  /**
   * Enable memory caching (default: true)
   */
  cache?: boolean

  /**
   * Enable file system cache for production (default: false)
   */
  fileCache?: boolean

  /**
   * Cache directory for file-based caching
   */
  cacheDir?: string

  /**
   * Show compilation errors in detail (default: true in dev)
   */
  verbose?: boolean
}

/**
 * Compiled module cache entry
 */
interface CacheEntry {
  code: string
  module: any
  timestamp: number
  filePath: string
}

/**
 * TSX/JSX Runtime Compiler
 * Compiles and caches JSX/TSX files at runtime using esbuild
 */
export class TsxCompiler {
  private memoryCache: Map<string, CacheEntry> = new Map()
  private options: Required<CompilerOptions>

  constructor(options: CompilerOptions = {}) {
    this.options = {
      cache: options.cache ?? true,
      fileCache: options.fileCache ?? false,
      cacheDir: options.cacheDir ?? path.join(process.cwd(), '.lyra-cache'),
      verbose: options.verbose ?? process.env.NODE_ENV !== 'production'
    }

    // Ensure cache directory exists if file caching is enabled
    if (this.options.fileCache && !fs.existsSync(this.options.cacheDir)) {
      fs.mkdirSync(this.options.cacheDir, { recursive: true })
    }
  }

  /**
   * Get file modification time
   */
  private getFileModTime(filePath: string): number {
    try {
      return fs.statSync(filePath).mtimeMs
    } catch {
      return 0
    }
  }

  /**
   * Generate cache key for a file
   */
  private getCacheKey(filePath: string): string {
    return path.resolve(filePath)
  }

  /**
   * Get cached file path for file-based caching
   */
  private getCacheFilePath(filePath: string): string {
    const hash = Buffer.from(filePath).toString('base64').replace(/[/+=]/g, '_')
    return path.join(this.options.cacheDir, `${hash}.js`)
  }

  /**
   * Check if memory cache is valid
   */
  private isMemoryCacheValid(cacheKey: string, filePath: string): boolean {
    if (!this.options.cache) return false

    const entry = this.memoryCache.get(cacheKey)
    if (!entry) return false

    // Check if source file has been modified
    const currentModTime = this.getFileModTime(filePath)
    return currentModTime <= entry.timestamp
  }

  /**
   * Load from file cache
   */
  private loadFromFileCache(filePath: string): string | null {
    if (!this.options.fileCache) return null

    try {
      const cacheFilePath = this.getCacheFilePath(filePath)
      if (!fs.existsSync(cacheFilePath)) return null

      // Check if cache is still valid
      const sourceMod = this.getFileModTime(filePath)
      const cacheMod = this.getFileModTime(cacheFilePath)

      if (sourceMod > cacheMod) {
        // Cache is stale
        fs.unlinkSync(cacheFilePath)
        return null
      }

      return fs.readFileSync(cacheFilePath, 'utf-8')
    } catch (error) {
      if (this.options.verbose) {
        console.warn(`Failed to load file cache for ${filePath}:`, error)
      }
      return null
    }
  }

  /**
   * Save to file cache
   */
  private saveToFileCache(filePath: string, code: string): void {
    if (!this.options.fileCache) return

    try {
      const cacheFilePath = this.getCacheFilePath(filePath)
      fs.writeFileSync(cacheFilePath, code, 'utf-8')
    } catch (error) {
      if (this.options.verbose) {
        console.warn(`Failed to save file cache for ${filePath}:`, error)
      }
    }
  }

  /**
   * Compile JSX/TSX file to JavaScript
   */
  private compileFile(filePath: string): string {
    // Read source file
    const source = fs.readFileSync(filePath, 'utf-8')

    // Determine loader based on file extension
    const ext = path.extname(filePath)
    const loader = ext === '.tsx' || ext === '.ts' ? 'tsx' : 'jsx'

    try {
      // Transform using esbuild
      // Note: esbuild must be installed in the user's project as a peer dependency
      const result = transformSync(source, {
        loader,
        format: 'cjs', // CommonJS format for require()
        target: 'node18',
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        sourcefile: filePath,
        sourcemap: this.options.verbose ? 'inline' : false,

        // Auto-inject JSX runtime - inlined version
        banner: this.getInlinedRuntime(),

        // Keep names for better debugging
        keepNames: true,

        // Minify in production
        minify: process.env.NODE_ENV === 'production',

        // Platform target
        platform: 'node'
      })

      return result.code
    } catch (error: any) {
      // Check if error is due to esbuild not being installed
      if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('esbuild')) {
        throw new Error(
          'esbuild is not installed. JSX/TSX engine requires esbuild.\n' +
          'Please install it by running: npm install esbuild'
        )
      }

      if (this.options.verbose) {
        console.error(`\nCompilation error in ${filePath}:`)
        console.error(error.message)
        if (error.errors) {
          error.errors.forEach((err: any) => {
            console.error(`  ${err.text}`)
            if (err.location) {
              console.error(`    at line ${err.location.line}, column ${err.location.column}`)
            }
          })
        }
      }
      throw new Error(`Failed to compile ${filePath}: ${error.message}`)
    }
  }

  /**
   * Get inlined JSX runtime
   * Returns the h() and Fragment functions as inline code
   */
  private getInlinedRuntime(): string {
    return `
// Inlined JSX Runtime
const Fragment = Symbol.for('jsx.fragment');
const SELF_CLOSING_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function escape(text) {
  if (text == null) return '';
  const str = String(text);
  return str.replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function renderProps(props) {
  if (!props) return '';
  const attrs = [];
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'key' || key === 'ref') continue;
    if (typeof value === 'boolean') {
      if (value) attrs.push(key);
      continue;
    }
    const attrName = key === 'className' ? 'class' : key;
    if (key === 'style' && typeof value === 'object') {
      const styleStr = Object.entries(value).map(([k,v]) => k.replace(/[A-Z]/g, m => '-'+m.toLowerCase())+':'+v).join(';');
      attrs.push('style="'+escape(styleStr)+'"');
      continue;
    }
    if (key.startsWith('on')) continue;
    attrs.push(attrName+'="'+escape(value)+'"');
  }
  return attrs.length > 0 ? ' '+attrs.join(' ') : '';
}
function flattenChildren(children) {
  const result = [];
  for (const child of children) {
    if (Array.isArray(child)) result.push(...flattenChildren(child));
    else if (child != null && child !== false) result.push(child);
  }
  return result;
}
function h(tag, props, ...children) {
  if (tag === Fragment) {
    const flat = flattenChildren(children);
    if (flat.some(c => c instanceof Promise)) return Promise.all(flat).then(r => r.join(''));
    return flat.join('');
  }
  if (typeof tag === 'function') {
    const componentProps = {...props, children: children.length === 1 ? children[0] : children};
    const result = tag(componentProps);
    if (result instanceof Promise) return result;
    if (Array.isArray(result)) {
      const flat = flattenChildren(result);
      if (flat.some(c => c instanceof Promise)) return Promise.all(flat).then(r => r.join(''));
      return flat.join('');
    }
    return result;
  }
  if (typeof tag === 'string') {
    const flat = flattenChildren(children);
    const hasAsync = flat.some(c => c instanceof Promise);
    if (SELF_CLOSING_TAGS.has(tag)) return '<'+tag+renderProps(props)+' />';
    if (hasAsync) {
      return Promise.all(flat).then(resolved => {
        const html = resolved.map(c => typeof c === 'string' ? c : typeof c === 'number' ? String(c) : escape(c)).join('');
        return '<'+tag+renderProps(props)+'>'+html+'</'+tag+'>';
      });
    }
    const html = flat.map(c => typeof c === 'string' ? c : typeof c === 'number' ? String(c) : escape(c)).join('');
    return '<'+tag+renderProps(props)+'>'+html+'</'+tag+'>';
  }
  throw new Error('Invalid JSX tag type: '+typeof tag);
}
`.trim()
  }

  /**
   * Load and execute compiled module
   */
  private loadModule(filePath: string, code: string): any {
    // Create a new module
    const module = { exports: {} }
    const dirname = path.dirname(filePath)
    const filename = filePath

    // Create a proper require function for ESM environment
    const require = createRequire(import.meta.url)

    // Create require function for the module
    const moduleRequire = (id: string) => {
      // Handle relative imports
      if (id.startsWith('.') || id.startsWith('/')) {
        const resolvedPath = path.resolve(dirname, id)

        // If it's a JSX/TSX file, compile it recursively
        if (/\.(tsx?|jsx)$/.test(resolvedPath)) {
          return this.compile(resolvedPath)
        }

        // Try to auto-detect file extension for relative imports
        const extensions = ['.tsx', '.ts', '.jsx', '.js']
        for (const ext of extensions) {
          const pathWithExt = resolvedPath + ext
          if (fs.existsSync(pathWithExt)) {
            if (ext === '.tsx' || ext === '.jsx' || ext === '.ts') {
              return this.compile(pathWithExt)
            }
            return require(pathWithExt)
          }
        }

        return require(resolvedPath)
      }

      // Handle TypeScript path aliases (like @app/...)
      if (id.startsWith('@')) {
        // Try to resolve using tsconfig paths
        // Common aliases: @app -> src, @src -> src, etc.
        const aliasMap: Record<string, string> = {
          '@app': path.resolve(process.cwd(), 'src'),
          '@src': path.resolve(process.cwd(), 'src'),
          '@': path.resolve(process.cwd(), 'src')
        }

        for (const [alias, basePath] of Object.entries(aliasMap)) {
          if (id.startsWith(alias + '/') || id === alias) {
            const relativePath = id.substring(alias.length)
            let resolvedPath = path.join(basePath, relativePath)

            // Try with different extensions
            const extensions = ['.tsx', '.ts', '.jsx', '.js', '']
            for (const ext of extensions) {
              const pathWithExt = resolvedPath + ext
              if (fs.existsSync(pathWithExt)) {
                if (ext === '.tsx' || ext === '.jsx' || ext === '.ts') {
                  return this.compile(pathWithExt)
                }
                return require(pathWithExt)
              }
            }
          }
        }
      }

      // Handle node_modules imports
      return require(id)
    }

    // Execute the code in a sandboxed context
    const wrapper = new Function(
      'exports',
      'require',
      'module',
      '__filename',
      '__dirname',
      code
    )

    wrapper(module.exports, moduleRequire, module, filename, dirname)

    return module.exports
  }

  /**
   * Compile a JSX/TSX file and return the module
   * Uses caching when enabled
   *
   * @param filePath - Absolute path to the JSX/TSX file
   * @returns Compiled module exports
   */
  compile(filePath: string): any {
    const cacheKey = this.getCacheKey(filePath)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file not found: ${filePath}`)
    }

    // Check memory cache
    if (this.isMemoryCacheValid(cacheKey, filePath)) {
      const entry = this.memoryCache.get(cacheKey)!
      return entry.module
    }

    // Check file cache
    let code = this.loadFromFileCache(filePath)

    // Compile if no valid cache
    if (!code) {
      code = this.compileFile(filePath)
      this.saveToFileCache(filePath, code)
    }

    // Load module
    const module = this.loadModule(filePath, code)

    // Save to memory cache
    if (this.options.cache) {
      this.memoryCache.set(cacheKey, {
        code,
        module,
        timestamp: this.getFileModTime(filePath),
        filePath
      })
    }

    return module
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.memoryCache.clear()

    if (this.options.fileCache && fs.existsSync(this.options.cacheDir)) {
      const files = fs.readdirSync(this.options.cacheDir)
      files.forEach((file) => {
        fs.unlinkSync(path.join(this.options.cacheDir, file))
      })
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryCacheSize: number
    fileCacheSize: number
    cachedFiles: string[]
  } {
    const cachedFiles = Array.from(this.memoryCache.values()).map((entry) => entry.filePath)

    let fileCacheSize = 0
    if (this.options.fileCache && fs.existsSync(this.options.cacheDir)) {
      fileCacheSize = fs.readdirSync(this.options.cacheDir).length
    }

    return {
      memoryCacheSize: this.memoryCache.size,
      fileCacheSize,
      cachedFiles
    }
  }
}
