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
export function serializeToXML(obj, rootName = 'root') {
    /**
     * Convert a value to XML element
     * @param {string} key - Element name
     * @param {any} value - Element value
     * @param {number} indent - Indentation level
     * @returns {string} - XML element string
     */
    function valueToXML(key, value, indent = 0) {
        const spaces = '  '.repeat(indent);
        if (value === null || value === undefined) {
            return `${spaces}<${key} />`;
        }
        if (typeof value === 'object' && !Array.isArray(value)) {
            // Separate attributes from child elements
            const attributes = [];
            const children = [];
            for (const [k, v] of Object.entries(value)) {
                if (k.startsWith('@')) {
                    // Attribute
                    const attrName = k.substring(1);
                    attributes.push(`${attrName}="${escapeXML(String(v))}"`);
                }
                else if (k === '_text') {
                    // Text content
                    children.push(escapeXML(String(v)));
                }
                else {
                    // Child element
                    children.push(valueToXML(k, v, indent + 1));
                }
            }
            const attrString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
            if (children.length === 0) {
                return `${spaces}<${key}${attrString} />`;
            }
            const hasOnlyText = children.length === 1 && !children[0].includes('<');
            if (hasOnlyText) {
                return `${spaces}<${key}${attrString}>${children[0]}</${key}>`;
            }
            return `${spaces}<${key}${attrString}>\n${children.join('\n')}\n${spaces}</${key}>`;
        }
        if (Array.isArray(value)) {
            // Handle arrays by repeating the element
            return value.map(item => valueToXML(key, item, indent)).join('\n');
        }
        // Primitive value
        return `${spaces}<${key}>${escapeXML(String(value))}</${key}>`;
    }
    /**
     * Escape special XML characters
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    function escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    // Handle root element
    if (typeof obj === 'object' && !Array.isArray(obj)) {
        const keys = Object.keys(obj);
        if (keys.length === 1 && !keys[0].startsWith('@')) {
            // Object has single key, use it as root
            const key = keys[0];
            return `<?xml version="1.0" encoding="UTF-8"?>\n${valueToXML(key, obj[key], 0)}`;
        }
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${valueToXML(rootName, obj, 0)}`;
}
/**
 * Parse XML string to JavaScript object
 * @param {string} xml - XML string to parse
 * @returns {any} - Parsed object
 */
export function parseXML(xml) {
    // Remove XML declaration and comments
    xml = xml.replace(/<\?xml.*?\?>/g, '').replace(/<!--.*?-->/gs, '').trim();
    /**
     * Parse a single XML node
     * @param {string} xmlString - XML string
     * @returns {any} - Parsed node
     */
    function parseNode(xmlString) {
        xmlString = xmlString.trim();
        // Match opening tag with attributes
        const tagMatch = xmlString.match(/^<([^\s>]+)(\s[^>]*)?>/);
        if (!tagMatch)
            return xmlString;
        const tagName = tagMatch[1];
        const attributesString = tagMatch[2] || '';
        // Check if it's a self-closing tag
        if (xmlString.match(/^<[^>]+\/>/)) {
            const attributes = parseAttributes(attributesString);
            return { [tagName]: { ...attributes } };
        }
        // Find matching closing tag
        const closingTag = `</${tagName}>`;
        const closingIndex = findClosingTag(xmlString, tagName);
        if (closingIndex === -1) {
            // No closing tag found, treat as text
            return xmlString;
        }
        // Extract content between opening and closing tags
        const contentStart = tagMatch[0].length;
        const content = xmlString.substring(contentStart, closingIndex).trim();
        // Parse attributes
        const attributes = parseAttributes(attributesString);
        // Check if content contains child elements or is just text
        if (!content.includes('<')) {
            // Plain text content
            const result = {};
            if (Object.keys(attributes).length > 0) {
                result[tagName] = {
                    _text: content,
                    ...attributes
                };
            }
            else {
                result[tagName] = content;
            }
            return result;
        }
        // Parse child elements
        const children = parseChildren(content);
        const result = {};
        if (Object.keys(attributes).length > 0) {
            result[tagName] = {
                ...attributes,
                ...children
            };
        }
        else {
            result[tagName] = children;
        }
        return result;
    }
    /**
     * Find the index of the matching closing tag
     * @param {string} xml - XML string
     * @param {string} tagName - Tag name to find closing tag for
     * @returns {number} - Index of closing tag or -1 if not found
     */
    function findClosingTag(xml, tagName) {
        const openTag = new RegExp(`<${tagName}[\\s>]`, 'g');
        const closeTag = new RegExp(`</${tagName}>`, 'g');
        let depth = 0;
        let position = 0;
        while (position < xml.length) {
            openTag.lastIndex = position;
            closeTag.lastIndex = position;
            const openMatch = openTag.exec(xml);
            const closeMatch = closeTag.exec(xml);
            if (!closeMatch)
                return -1;
            if (openMatch && openMatch.index < closeMatch.index) {
                depth++;
                position = openMatch.index + openMatch[0].length;
            }
            else {
                if (depth === 0) {
                    return closeMatch.index;
                }
                depth--;
                position = closeMatch.index + closeMatch[0].length;
            }
        }
        return -1;
    }
    /**
     * Parse attributes from attribute string
     * @param {string} attrString - Attributes string
     * @returns {any} - Object with attributes
     */
    function parseAttributes(attrString) {
        const attributes = {};
        const attrRegex = /(\w+)=["']([^"']*)["']/g;
        let match;
        while ((match = attrRegex.exec(attrString)) !== null) {
            attributes[`@${match[1]}`] = match[2];
        }
        return attributes;
    }
    /**
     * Parse child elements
     * @param {string} content - Content string
     * @returns {any} - Parsed children
     */
    function parseChildren(content) {
        const children = {};
        let position = 0;
        while (position < content.length) {
            const remaining = content.substring(position).trim();
            if (!remaining || !remaining.startsWith('<'))
                break;
            // Find the next tag
            const tagMatch = remaining.match(/^<([^\s>\/]+)/);
            if (!tagMatch)
                break;
            const tagName = tagMatch[1];
            const closingIndex = findClosingTag(remaining, tagName);
            if (closingIndex === -1)
                break;
            const endOfTag = remaining.indexOf(`</${tagName}>`) + `</${tagName}>`.length;
            const element = remaining.substring(0, endOfTag);
            const parsed = parseNode(element);
            // Merge into children
            const key = Object.keys(parsed)[0];
            if (children[key]) {
                // Multiple elements with same tag name - convert to array
                if (!Array.isArray(children[key])) {
                    children[key] = [children[key]];
                }
                children[key].push(parsed[key]);
            }
            else {
                children[key] = parsed[key];
            }
            position += content.indexOf(element, position) + element.length;
        }
        return children;
    }
    // Start parsing from root
    return parseNode(xml);
}
//# sourceMappingURL=xmlParser.js.map