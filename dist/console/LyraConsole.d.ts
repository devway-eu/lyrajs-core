declare class LyraConsoleClass {
    closeByNewLine: boolean;
    useIcons: boolean;
    logsTitle: string;
    warningsTitle: string;
    errorsTitle: string;
    informationsTitle: string;
    successesTitle: string;
    debugsTitle: string;
    assertsTitle: string;
    constructor();
    private getColor;
    private getColorReset;
    print(foregroundColor?: string, backgroundColor?: string, ...strings: unknown[]): void;
    clear(): void;
    log(...strings: string[]): void;
    warn(...strings: string[]): void;
    error(...strings: string[]): void;
    info(...strings: string[]): void;
    success(...strings: string[]): void;
    debug(...strings: string[]): void;
    assert(...strings: string[]): void;
}
export declare const LyraConsole: LyraConsoleClass;
export {};
