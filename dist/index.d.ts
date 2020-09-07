import { Store, InjectStoreModules, ModuleEvent } from 'natur';
declare type ModuleEventType = ModuleEvent['type'];
declare type ServiceListenerParamsTypeMap<StoreType extends InjectStoreModules, M extends keyof StoreType> = {
    [t in ModuleEventType]: {
        type: t;
        actionName: t extends 'update' ? keyof StoreType[M]['actions'] : undefined;
        oldModule: t extends 'init' ? undefined : StoreType[M];
        newModule: t extends 'remove' ? undefined : StoreType[M];
        state: t extends 'remove' ? undefined : StoreType[M]['state'];
    };
};
export default class NaturService<ST extends InjectStoreModules> {
    static storeGetter: () => Store<any, any>;
    dispatchPromise: {
        [type: string]: {
            value: Promise<any> | undefined;
            cancel: Function;
        };
    };
    listener: Array<Function>;
    constructor();
    protected dispatch<MN extends keyof ST, AN extends keyof ST[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<ST[MN]['actions'][AN]>): Promise<ReturnType<ST[MN]['actions'][AN]>>;
    private _getModule;
    protected getStore(): Store<ST, any, Partial<{ [k in keyof ST]: Partial<ST[k]["state"]>; }>>;
    protected watch<MN extends keyof ST>(moduleName: MN, watcher: <T extends ModuleEventType>(me: ServiceListenerParamsTypeMap<ST, MN>[T]) => any): Promise<void>;
    destroy(): void;
}
export {};
