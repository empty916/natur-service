import { Store, InjectStoreModule, ModuleEvent } from 'natur';
declare type ServiceListenerParams = ModuleEvent & {
    oldModule: InjectStoreModule;
    newModule: InjectStoreModule;
};
declare type ServiceListener = (me: ServiceListenerParams) => any;
declare class NaturService {
    static store: Store;
    [mn: string]: any;
    private listener;
    getModule(moduleName: string, onUpdate?: ServiceListener): void;
    private _getModule;
    private sub;
    destroy(): void;
}
export default NaturService;
