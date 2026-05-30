export declare class QueriesBatcher {
    private readonly queries;
    constructor(queries?: Promise<unknown>[]);
    add(query: Promise<unknown>): void;
    execute(): Promise<void>;
    executeAndGetResponses<T = unknown>(): Promise<T[]>;
    executeSettled(): Promise<void>;
}
