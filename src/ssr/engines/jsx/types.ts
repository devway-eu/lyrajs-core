/**
 * TypeScript JSX Type Definitions for LyraJS
 * Provides type checking for JSX/TSX templates
 */

/**
 * Intrinsic HTML elements and their attributes
 * This enables TypeScript to type-check JSX elements
 */
declare global {
  namespace JSX {
    // Base element type
    type Element = string | Promise<string>

    // Intrinsic elements - all standard HTML tags
    interface IntrinsicElements {
      // Document metadata
      html: HtmlHTMLAttributes
      head: HTMLAttributes
      title: HTMLAttributes
      base: BaseHTMLAttributes
      link: LinkHTMLAttributes
      meta: MetaHTMLAttributes
      style: StyleHTMLAttributes

      // Content sectioning
      body: HTMLAttributes
      article: HTMLAttributes
      section: HTMLAttributes
      nav: HTMLAttributes
      aside: HTMLAttributes
      h1: HTMLAttributes
      h2: HTMLAttributes
      h3: HTMLAttributes
      h4: HTMLAttributes
      h5: HTMLAttributes
      h6: HTMLAttributes
      header: HTMLAttributes
      footer: HTMLAttributes
      address: HTMLAttributes
      main: HTMLAttributes

      // Text content
      p: HTMLAttributes
      hr: HTMLAttributes
      pre: HTMLAttributes
      blockquote: BlockquoteHTMLAttributes
      ol: OlHTMLAttributes
      ul: HTMLAttributes
      li: LiHTMLAttributes
      dl: HTMLAttributes
      dt: HTMLAttributes
      dd: HTMLAttributes
      figure: HTMLAttributes
      figcaption: HTMLAttributes
      div: HTMLAttributes

      // Inline text
      a: AnchorHTMLAttributes
      em: HTMLAttributes
      strong: HTMLAttributes
      small: HTMLAttributes
      s: HTMLAttributes
      cite: HTMLAttributes
      q: QuoteHTMLAttributes
      dfn: HTMLAttributes
      abbr: HTMLAttributes
      data: DataHTMLAttributes
      time: TimeHTMLAttributes
      code: HTMLAttributes
      var: HTMLAttributes
      samp: HTMLAttributes
      kbd: HTMLAttributes
      sub: HTMLAttributes
      sup: HTMLAttributes
      i: HTMLAttributes
      b: HTMLAttributes
      u: HTMLAttributes
      mark: HTMLAttributes
      ruby: HTMLAttributes
      rt: HTMLAttributes
      rp: HTMLAttributes
      bdi: HTMLAttributes
      bdo: HTMLAttributes
      span: HTMLAttributes
      br: HTMLAttributes
      wbr: HTMLAttributes

      // Image and multimedia
      img: ImgHTMLAttributes
      iframe: IframeHTMLAttributes
      embed: EmbedHTMLAttributes
      object: ObjectHTMLAttributes
      param: ParamHTMLAttributes
      video: VideoHTMLAttributes
      audio: AudioHTMLAttributes
      source: SourceHTMLAttributes
      track: TrackHTMLAttributes
      canvas: CanvasHTMLAttributes
      map: MapHTMLAttributes
      area: AreaHTMLAttributes
      svg: SVGAttributes
      math: HTMLAttributes

      // Table content
      table: TableHTMLAttributes
      caption: HTMLAttributes
      colgroup: ColgroupHTMLAttributes
      col: ColHTMLAttributes
      tbody: HTMLAttributes
      thead: HTMLAttributes
      tfoot: HTMLAttributes
      tr: HTMLAttributes
      td: TdHTMLAttributes
      th: ThHTMLAttributes

      // Forms
      form: FormHTMLAttributes
      label: LabelHTMLAttributes
      input: InputHTMLAttributes
      button: ButtonHTMLAttributes
      select: SelectHTMLAttributes
      datalist: HTMLAttributes
      optgroup: OptgroupHTMLAttributes
      option: OptionHTMLAttributes
      textarea: TextareaHTMLAttributes
      output: OutputHTMLAttributes
      progress: ProgressHTMLAttributes
      meter: MeterHTMLAttributes
      fieldset: FieldsetHTMLAttributes
      legend: HTMLAttributes

      // Interactive elements
      details: DetailsHTMLAttributes
      summary: HTMLAttributes
      dialog: DialogHTMLAttributes
      menu: MenuHTMLAttributes

      // Scripting
      script: ScriptHTMLAttributes
      noscript: HTMLAttributes
      template: HTMLAttributes
      slot: SlotHTMLAttributes
    }

    // Common HTML attributes
    interface HTMLAttributes {
      // Standard HTML attributes
      id?: string
      class?: string
      className?: string
      style?: string | CSSProperties
      title?: string
      lang?: string
      dir?: 'ltr' | 'rtl' | 'auto'
      hidden?: boolean
      tabindex?: number
      accesskey?: string
      contenteditable?: boolean | 'true' | 'false'
      spellcheck?: boolean
      draggable?: boolean
      translate?: 'yes' | 'no'

      // ARIA attributes
      role?: string
      'aria-label'?: string
      'aria-labelledby'?: string
      'aria-describedby'?: string
      'aria-hidden'?: boolean | 'true' | 'false'
      'aria-expanded'?: boolean | 'true' | 'false'
      'aria-pressed'?: boolean | 'true' | 'false'
      'aria-selected'?: boolean | 'true' | 'false'
      'aria-checked'?: boolean | 'true' | 'false' | 'mixed'
      'aria-disabled'?: boolean | 'true' | 'false'
      'aria-readonly'?: boolean | 'true' | 'false'
      'aria-required'?: boolean | 'true' | 'false'
      'aria-invalid'?: boolean | 'true' | 'false'
      'aria-live'?: 'off' | 'polite' | 'assertive'
      'aria-atomic'?: boolean | 'true' | 'false'
      'aria-busy'?: boolean | 'true' | 'false'

      // Data attributes
      [key: `data-${string}`]: any

      // Event handlers (no-op in SSR but typed for completeness)
      onclick?: string
      onchange?: string
      onsubmit?: string
      oninput?: string
      onkeydown?: string
      onkeyup?: string
      onkeypress?: string
      onmousedown?: string
      onmouseup?: string
      onmouseover?: string
      onmouseout?: string
      onmousemove?: string
      onfocus?: string
      onblur?: string

      // Children
      children?: any
    }

    // CSS Properties type
    interface CSSProperties {
      [key: string]: string | number
    }

    // Specific element attributes
    interface AnchorHTMLAttributes extends HTMLAttributes {
      href?: string
      target?: '_blank' | '_self' | '_parent' | '_top'
      rel?: string
      download?: string
      hreflang?: string
      type?: string
    }

    interface ImgHTMLAttributes extends HTMLAttributes {
      src?: string
      alt?: string
      width?: number | string
      height?: number | string
      loading?: 'lazy' | 'eager'
      decoding?: 'async' | 'sync' | 'auto'
      srcset?: string
      sizes?: string
    }

    interface InputHTMLAttributes extends HTMLAttributes {
      type?: string
      name?: string
      value?: string | number
      placeholder?: string
      disabled?: boolean
      readonly?: boolean
      required?: boolean
      checked?: boolean
      min?: number | string
      max?: number | string
      step?: number | string
      pattern?: string
      autocomplete?: string
      autofocus?: boolean
      multiple?: boolean
      accept?: string
    }

    interface ButtonHTMLAttributes extends HTMLAttributes {
      type?: 'button' | 'submit' | 'reset'
      disabled?: boolean
      name?: string
      value?: string
      form?: string
    }

    interface FormHTMLAttributes extends HTMLAttributes {
      action?: string
      method?: 'get' | 'post'
      enctype?: string
      target?: string
      autocomplete?: 'on' | 'off'
      novalidate?: boolean
    }

    interface TextareaHTMLAttributes extends HTMLAttributes {
      name?: string
      rows?: number
      cols?: number
      disabled?: boolean
      readonly?: boolean
      required?: boolean
      placeholder?: string
      value?: string
      maxlength?: number
      minlength?: number
      wrap?: 'soft' | 'hard'
    }

    interface SelectHTMLAttributes extends HTMLAttributes {
      name?: string
      disabled?: boolean
      required?: boolean
      multiple?: boolean
      size?: number
      autocomplete?: string
      value?: string
    }

    interface OptionHTMLAttributes extends HTMLAttributes {
      value?: string
      selected?: boolean
      disabled?: boolean
      label?: string
    }

    interface LabelHTMLAttributes extends HTMLAttributes {
      for?: string
      form?: string
    }

    interface LinkHTMLAttributes extends HTMLAttributes {
      href?: string
      rel?: string
      type?: string
      media?: string
      as?: string
      crossorigin?: 'anonymous' | 'use-credentials'
      integrity?: string
    }

    interface MetaHTMLAttributes extends HTMLAttributes {
      name?: string
      content?: string
      charset?: string
      'http-equiv'?: string
    }

    interface ScriptHTMLAttributes extends HTMLAttributes {
      src?: string
      type?: string
      async?: boolean
      defer?: boolean
      crossorigin?: 'anonymous' | 'use-credentials'
      integrity?: string
      nomodule?: boolean
    }

    interface StyleHTMLAttributes extends HTMLAttributes {
      media?: string
      type?: string
    }

    interface VideoHTMLAttributes extends HTMLAttributes {
      src?: string
      controls?: boolean
      autoplay?: boolean
      loop?: boolean
      muted?: boolean
      poster?: string
      width?: number | string
      height?: number | string
      preload?: 'none' | 'metadata' | 'auto'
    }

    interface AudioHTMLAttributes extends HTMLAttributes {
      src?: string
      controls?: boolean
      autoplay?: boolean
      loop?: boolean
      muted?: boolean
      preload?: 'none' | 'metadata' | 'auto'
    }

    interface SourceHTMLAttributes extends HTMLAttributes {
      src?: string
      type?: string
      media?: string
      srcset?: string
      sizes?: string
    }

    interface TableHTMLAttributes extends HTMLAttributes {
      cellpadding?: number | string
      cellspacing?: number | string
      border?: number | string
    }

    interface TdHTMLAttributes extends HTMLAttributes {
      colspan?: number
      rowspan?: number
      headers?: string
    }

    interface ThHTMLAttributes extends TdHTMLAttributes {
      scope?: 'col' | 'row' | 'colgroup' | 'rowgroup'
    }

    interface IframeHTMLAttributes extends HTMLAttributes {
      src?: string
      srcdoc?: string
      name?: string
      width?: number | string
      height?: number | string
      sandbox?: string
      allow?: string
      loading?: 'lazy' | 'eager'
    }

    interface CanvasHTMLAttributes extends HTMLAttributes {
      width?: number | string
      height?: number | string
    }

    interface SVGAttributes extends HTMLAttributes {
      xmlns?: string
      viewBox?: string
      width?: number | string
      height?: number | string
      fill?: string
      stroke?: string
    }

    // Additional specific attributes
    interface HtmlHTMLAttributes extends HTMLAttributes {
      xmlns?: string
    }

    interface BaseHTMLAttributes extends HTMLAttributes {
      href?: string
      target?: string
    }

    interface BlockquoteHTMLAttributes extends HTMLAttributes {
      cite?: string
    }

    interface OlHTMLAttributes extends HTMLAttributes {
      start?: number
      type?: '1' | 'a' | 'A' | 'i' | 'I'
      reversed?: boolean
    }

    interface LiHTMLAttributes extends HTMLAttributes {
      value?: number
    }

    interface QuoteHTMLAttributes extends HTMLAttributes {
      cite?: string
    }

    interface DataHTMLAttributes extends HTMLAttributes {
      value?: string
    }

    interface TimeHTMLAttributes extends HTMLAttributes {
      datetime?: string
    }

    interface EmbedHTMLAttributes extends HTMLAttributes {
      src?: string
      type?: string
      width?: number | string
      height?: number | string
    }

    interface ObjectHTMLAttributes extends HTMLAttributes {
      data?: string
      type?: string
      width?: number | string
      height?: number | string
      name?: string
      form?: string
    }

    interface ParamHTMLAttributes extends HTMLAttributes {
      name?: string
      value?: string
    }

    interface TrackHTMLAttributes extends HTMLAttributes {
      src?: string
      kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
      srclang?: string
      label?: string
      default?: boolean
    }

    interface MapHTMLAttributes extends HTMLAttributes {
      name?: string
    }

    interface AreaHTMLAttributes extends HTMLAttributes {
      alt?: string
      coords?: string
      href?: string
      shape?: 'rect' | 'circle' | 'poly' | 'default'
      target?: string
      download?: string
    }

    interface ColgroupHTMLAttributes extends HTMLAttributes {
      span?: number
    }

    interface ColHTMLAttributes extends HTMLAttributes {
      span?: number
    }

    interface OptgroupHTMLAttributes extends HTMLAttributes {
      label?: string
      disabled?: boolean
    }

    interface OutputHTMLAttributes extends HTMLAttributes {
      for?: string
      form?: string
      name?: string
    }

    interface ProgressHTMLAttributes extends HTMLAttributes {
      max?: number
      value?: number
    }

    interface MeterHTMLAttributes extends HTMLAttributes {
      min?: number
      max?: number
      low?: number
      high?: number
      optimum?: number
      value?: number
    }

    interface FieldsetHTMLAttributes extends HTMLAttributes {
      disabled?: boolean
      form?: string
      name?: string
    }

    interface DetailsHTMLAttributes extends HTMLAttributes {
      open?: boolean
    }

    interface DialogHTMLAttributes extends HTMLAttributes {
      open?: boolean
    }

    interface MenuHTMLAttributes extends HTMLAttributes {
      type?: 'context' | 'toolbar'
    }

    interface SlotHTMLAttributes extends HTMLAttributes {
      name?: string
    }
  }
}

export {}
