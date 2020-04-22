import { Store, InjectStoreModule, ModuleEvent, State } from 'natur';
declare type ServiceListenerParams = ModuleEvent & {
    oldModule: InjectStoreModule | undefined;
    newModule: InjectStoreModule | undefined;
    state: State;
};
declare type ServiceListener = (me: ServiceListenerParams) => any;
declare class NaturService {
    static store: Store;
    [mn: string]: any;
    protected store: Store;
    private moduleHasLoadPromise;
    protected listener: Array<Function>;
    constructor();
    protected getModule(moduleName: string): void;
    private _getModule;
    dispatch(type: string, ...arg: any[]): Promise<any>;
    protected watch(moduleName: string, watcher: ServiceListener): void;
    destroy(): void;
}
export default NaturService;
