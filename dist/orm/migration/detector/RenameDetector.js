/**
 * RenameDetector
 * Detects potential table and column renames using similarity algorithms
 * Helps prevent accidental data loss from DROP + CREATE operations
 */
export class RenameDetector {
    constructor() {
        this.SIMILARITY_THRESHOLD = 0.6; // 60% similarity minimum
        this.HIGH_CONFIDENCE_THRESHOLD = 0.8; // 80% for high confidence
    }
    /**
     * Detect potential column renames within a table
     */
    detectColumnRenames(tableName, removedColumns, addedColumns) {
        const renames = [];
        for (const removed of removedColumns) {
            for (const added of addedColumns) {
                // Calculate name similarity
                const nameSimilarity = this.calculateSimilarity(removed.name, added.name);
                // Check if types are compatible
                const typeCompatible = this.areTypesCompatible(removed.type, added.type);
                // Check if constraints match
                const constraintsMatch = this.doConstraintsMatch(removed, added);
                // Calculate overall confidence
                let confidence = nameSimilarity * 0.5; // Name is 50% of confidence
                if (typeCompatible) {
                    confidence += 0.3; // Type compatibility is 30%
                }
                if (constraintsMatch) {
                    confidence += 0.2; // Constraints are 20%
                }
                // If confidence is above threshold, it's likely a rename
                if (confidence >= this.SIMILARITY_THRESHOLD) {
                    renames.push({
                        table: tableName,
                        from: removed.name,
                        to: added.name,
                        confidence: Math.round(confidence * 100) / 100
                    });
                }
            }
        }
        // Sort by confidence (highest first) and return only best matches
        renames.sort((a, b) => b.confidence - a.confidence);
        // Remove duplicates - keep only highest confidence match for each column
        const uniqueRenames = [];
        const usedFrom = new Set();
        const usedTo = new Set();
        for (const rename of renames) {
            if (!usedFrom.has(rename.from) && !usedTo.has(rename.to)) {
                uniqueRenames.push(rename);
                usedFrom.add(rename.from);
                usedTo.add(rename.to);
            }
        }
        return uniqueRenames;
    }
    /**
     * Detect potential table renames
     */
    detectTableRenames(removedTables, addedTables) {
        const renames = [];
        for (const removed of removedTables) {
            let bestMatch = null;
            for (const added of addedTables) {
                // Calculate name similarity
                const nameSimilarity = this.calculateSimilarity(removed.name, added.name);
                // Calculate structural similarity (columns)
                const structureSimilarity = this.calculateTableStructureSimilarity(removed, added);
                // Combined confidence (60% name, 40% structure)
                const confidence = nameSimilarity * 0.6 + structureSimilarity * 0.4;
                if (confidence >= this.SIMILARITY_THRESHOLD) {
                    if (!bestMatch || confidence > bestMatch.confidence) {
                        bestMatch = { table: added, confidence };
                    }
                }
            }
            if (bestMatch && bestMatch.confidence >= this.SIMILARITY_THRESHOLD) {
                renames.push({
                    from: removed.name,
                    to: bestMatch.table.name
                });
            }
        }
        return renames;
    }
    /**
     * Calculate Levenshtein distance-based similarity (0-1 scale)
     */
    calculateSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        const matrix = [];
        for (let i = 0; i <= s1.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= s2.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        const maxLen = Math.max(s1.length, s2.length);
        return maxLen === 0 ? 1 : 1 - matrix[s1.length][s2.length] / maxLen;
    }
    /**
     * Calculate structural similarity between two tables
     */
    calculateTableStructureSimilarity(table1, table2) {
        if (table1.columns.length === 0 && table2.columns.length === 0) {
            return 1;
        }
        const cols1 = new Set(table1.columns.map(c => c.name.toLowerCase()));
        const cols2 = new Set(table2.columns.map(c => c.name.toLowerCase()));
        // Count common columns
        let commonColumns = 0;
        for (const col of cols1) {
            if (cols2.has(col)) {
                commonColumns++;
            }
        }
        const totalColumns = Math.max(cols1.size, cols2.size);
        return totalColumns === 0 ? 0 : commonColumns / totalColumns;
    }
    /**
     * Check if two column types are compatible
     */
    areTypesCompatible(type1, type2) {
        const t1 = this.normalizeType(type1);
        const t2 = this.normalizeType(type2);
        // Exact match
        if (t1 === t2)
            return true;
        // Compatible type families
        const intTypes = ["tinyint", "smallint", "mediumint", "int", "bigint"];
        const textTypes = ["varchar", "char", "text", "tinytext", "mediumtext", "longtext"];
        const floatTypes = ["float", "double", "decimal"];
        const dateTypes = ["date", "datetime", "timestamp"];
        if (intTypes.includes(t1) && intTypes.includes(t2))
            return true;
        if (textTypes.includes(t1) && textTypes.includes(t2))
            return true;
        if (floatTypes.includes(t1) && floatTypes.includes(t2))
            return true;
        if (dateTypes.includes(t1) && dateTypes.includes(t2))
            return true;
        return false;
    }
    /**
     * Check if column constraints match
     */
    doConstraintsMatch(col1, col2) {
        return (col1.nullable === col2.nullable &&
            col1.unique === col2.unique &&
            col1.primary === col2.primary);
    }
    /**
     * Normalize type names for comparison
     */
    normalizeType(type) {
        const normalized = type.toLowerCase().trim();
        const typeMap = {
            "int": "int",
            "integer": "int",
            "tinyint": "tinyint",
            "smallint": "smallint",
            "mediumint": "mediumint",
            "bigint": "bigint",
            "bool": "tinyint",
            "boolean": "tinyint",
            "varchar": "varchar",
            "char": "char",
            "text": "text",
            "tinytext": "tinytext",
            "mediumtext": "mediumtext",
            "longtext": "longtext",
            "float": "float",
            "double": "double",
            "decimal": "decimal",
            "date": "date",
            "time": "time",
            "datetime": "datetime",
            "timestamp": "timestamp",
            "year": "year",
            "blob": "blob",
            "json": "json",
            "enum": "enum"
        };
        return typeMap[normalized] || normalized;
    }
    /**
     * Check if a rename has high confidence
     */
    isHighConfidence(confidence) {
        return confidence >= this.HIGH_CONFIDENCE_THRESHOLD;
    }
}
//# sourceMappingURL=RenameDetector.js.map