import { InjectStoreModules, ModuleEvent } from 'natur';
import { GenerateStoreType, LazyStoreModules, Modules, Store } from 'natur/dist/ts-utils';
declare type ModuleEventType = ModuleEvent['type'];
declare type ServiceListenerParamsTypeMap<StoreType extends InjectStoreModules, M extends keyof StoreType> = {
    [t in ModuleEventType]: {
        type: t;
        actionName: t extends 'update' ? (keyof StoreType[M]['actions'] | 'globalSetStates' | 'globalResetStates') : undefined;
        oldModule: t extends 'init' ? undefined : StoreType[M];
        newModule: t extends 'remove' ? undefined : StoreType[M];
        state: t extends 'remove' ? undefined : StoreType[M]['state'];
    };
};
export default class NaturService<M extends Modules, LM extends LazyStoreModules, S extends Store<M, LM> = Store<M, LM>, ST extends InjectStoreModules = GenerateStoreType<M, LM>> {
    dispatchPromise: {
        [type: string]: {
            value: Promise<any> | undefined;
            cancel: Function;
        };
    };
    store: S;
    listener: Array<Function>;
    constructor(s: S);
    protected dispatch<MN extends Extract<keyof ST, string>, AN extends Extract<keyof ST[MN]['actions'], string>>(moduleName: MN, actionName: AN, ...arg: Parameters<ST[MN]['actions'][AN]>): Promise<ReturnType<ST[MN]['actions'][AN]>>;
    private _getModule;
    protected getStore(): S;
    protected watch<MN extends keyof ST>(moduleName: MN, watcher: <T extends ModuleEventType>(me: ServiceListenerParamsTypeMap<ST, MN>[T]) => any): Promise<void>;
    destroy(): void;
}
export {};
