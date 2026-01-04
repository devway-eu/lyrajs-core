/**
 * Built-in lightweight XML parser and serializer for LyraJS
 * Converts XML strings to JavaScript objects and vice versa
 */
/**
 * Serialize JavaScript object to XML string
 * @param {any} obj - Object to serialize
 * @param {string} [rootName='root'] - Root element name
 * @returns {string} - XML string
 */
export declare function serializeToXML(obj: any, rootName?: string): string;
/**
 * Parse XML string to JavaScript object
 * @param {string} xml - XML string to parse
 * @returns {any} - Parsed object
 */
export declare function parseXML(xml: string): any;
