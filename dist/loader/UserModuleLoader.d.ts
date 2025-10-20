declare class UserModuleLoader {
    private projectRoot?;
    private srcRoot;
    constructor();
    loadProjectEntity(entityName: string): Promise<any>;
    loadProjectRepository(repositoryName: string): Promise<any>;
    loadProjectFixtures(): Promise<any>;
    private loadUserModule;
}
export declare const ProjectModuleLoader: UserModuleLoader;
export {};
