export class QueriesBatcher {
    constructor(queries = []) {
        this.queries = queries;
        return this;
    }
    add(query) {
        this.queries.push(query);
    }
    async execute() {
        await Promise.all(this.queries);
    }
    async executeAndGetResponses() {
        return (await Promise.all(this.queries));
    }
    async executeSettled() {
        await Promise.allSettled(this.queries);
    }
}
//# sourceMappingURL=QueriesBatcher.js.map