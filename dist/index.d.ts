import { InjectStoreModules, ModuleEvent } from 'natur';
import { _Store } from 'natur/dist/ts-utils';
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
    protected getStore(): undefined | _Store<ST, any>;
    protected watch<MN extends keyof ST>(moduleName: MN, watcher: <T extends ModuleEventType>(me: ServiceListenerParamsTypeMap<ST, MN>[T]) => any): Promise<void>;
    destroy(): void;
}
export {};
