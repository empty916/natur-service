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
    private dispatchPromise;
    protected listener: Array<Function>;
    constructor();
    protected bindModule(moduleName: string, myName?: string): void;
    private _getModule;
    protected dispatch(type: string, ...arg: any[]): Promise<any>;
    protected watch(moduleName: string, watcher: ServiceListener): void;
    destroy(): void;
}
export default NaturService;
