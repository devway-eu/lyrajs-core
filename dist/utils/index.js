export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
/**
 * Get all values from a TypeScript enum
 * @param enumObj - TypeScript enum object (string or numeric enum)
 * @returns Array of enum values
 * @example
 * enum Status { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE" }
 * getEnumValues(Status) // ["ACTIVE", "INACTIVE"]
 */
export const getEnumValues = (enumObj) => {
    return Object.values(enumObj).filter(v => typeof v === "string");
};
//# sourceMappingURL=index.js.map