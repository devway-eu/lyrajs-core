export class Sanitizer {
    static sanitizeEntityData(entity, data) {
        const allowed = Object.keys(new entity());
        return Object.fromEntries(Object.entries(data).filter(([key]) => allowed.includes(key)));
    }
    static sanitizeString(str) {
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
            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
}
//# sourceMappingURL=Sanitizer.js.map