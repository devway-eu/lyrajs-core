export declare const capitalize: (str: string) => string;
/**
 * Get all values from a TypeScript enum
 * @param enumObj - TypeScript enum object (string or numeric enum)
 * @returns Array of enum values
 * @example
 * enum Status { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE" }
 * getEnumValues(Status) // ["ACTIVE", "INACTIVE"]
 */
export declare const getEnumValues: <T extends Record<string, string | number>>(enumObj: T) => T[keyof T][];
