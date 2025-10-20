export interface ICommand {
    execute(args: string[]): Promise<void>;
}
export declare class Kernel {
    private static commands;
    static run(argv: string[]): Promise<void>;
}
