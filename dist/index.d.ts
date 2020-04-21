import { Store, InjectStoreModule, ModuleEvent, State } from 'natur';
declare type ServiceListenerParams = ModuleEvent & {
    oldModule: InjectStoreModule;
    newModule: InjectStoreModule;
    state: State;
};
declare type ServiceListener = (me: ServiceListenerParams) => any;
declare class NaturService {
    static store: Store;
    [mn: string]: any;
    protected listener: Array<Function>;
    protected getModule(moduleName: string, onUpdate?: ServiceListener): void;
    private _getModule;
    protected sub(moduleName: string, onUpdate?: ServiceListener): void;
    destroy(): void;
}
export default NaturService;
