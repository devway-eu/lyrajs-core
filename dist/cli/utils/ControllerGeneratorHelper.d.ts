export interface ControllerObjType {
    name: string;
    type: "Entity based" | "Blank controller with methods" | "Totally blank controller" | null;
    baseEntity: string | null;
}
export declare class ControllerGeneratorHelper {
    static getFullControllerCode(controller: ControllerObjType): string;
    private static getEntityBaseControllerCode;
    private static getBlankControllerCode;
    private static getTotallyBlankControllerCode;
}
