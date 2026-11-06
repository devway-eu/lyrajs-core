export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Get all values from a TypeScript enum
 * @param enumObj - TypeScript enum object (string or numeric enum)
 * @returns Array of enum values
 * @example
 * enum Status { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE" }
 * getEnumValues(Status) // ["ACTIVE", "INACTIVE"]
 */
export const getEnumValues = <T extends Record<string, string | number>>(enumObj: T): T[keyof T][] => {
  return Object.values(enumObj).filter(v => typeof v === "string") as T[keyof T][]
}
