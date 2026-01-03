export interface ControllerObjType {
    name: string;
    type: "Entity based" | "Blank controller with methods" | "Totally blank controller" | null;
    baseEntity: string | null;
    useDecorators: boolean;
}
export declare class ControllerGeneratorHelper {
    private static pluralize;
    static getFullControllerCode(controller: ControllerObjType): string;
    private static getEntityBaseControllerCode;
    private static getBlankControllerCode;
    private static getTotallyBlankControllerCode;
    private static getDecoratorEntityBaseControllerCode;
    private static getDecoratorBlankControllerCode;
}
