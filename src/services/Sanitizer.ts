export class Sanitizer {
  static sanitizeEntityData<T extends object>(entity: new () => T, data: object): Partial<T> {
    const allowed = Object.keys(new entity()) as (keyof T)[]
    return Object.fromEntries(Object.entries(data).filter(([key]) => allowed.includes(key as keyof T))) as Partial<T>
  }

  static sanitizeString(str: string) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/`/g, "&#96;")
      .replace(/\\/g, "&#92;")
      .replace(/\n/g, "<br />")
      .replace(/\r/g, "<br />")
      .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
  }
}