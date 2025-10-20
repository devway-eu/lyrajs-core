export class ObjectCleaner {
    static removeId(obj) {
        if (obj.id)
            delete obj.id;
        return obj;
    }
    static removeMethods(obj) {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "function")
                delete obj[key];
        });
        return obj;
    }
}
//# sourceMappingURL=ObjectCleaner.js.map