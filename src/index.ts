import { InjectStoreModules, ModuleEvent } from "natur";
import {
  GenerateStoreType,
  LazyStoreModules,
  Modules,
  PickedLazyStoreModules,
  PickLazyStoreModules,
  Store,
} from "natur/dist/ts-utils";
import {
  getValueFromObjByKeyPath,
  setValueFromObjByKeyPath,
} from "./utils";

import type {
	ModuleEventType,
	ObjKeyPaths,
	ServiceListenerParamsTypeMap,
} from './utils';


// 停止上一次推送码
const STOP_THE_LAST_DISPATCH_CODE = 0;

export default class NaturService<
  // S extends Store<Modules, LazyStoreModules>,
  // M extends Modules = S extends Store<infer MV, LazyStoreModules> ? MV : never,
  // LM extends LazyStoreModules = S extends Store<Modules, infer LMV> ? LMV : never,
  // ST extends InjectStoreModules = GenerateStoreType<M, LM>,
  M extends Modules,
  LM extends LazyStoreModules,
  S extends Store<M, LM> = Store<M, LM>,
  ST extends InjectStoreModules = GenerateStoreType<M, LM>
> {
  dispatchPromise: {
    [type: string]: {
      value: Promise<any> | undefined;
      cancel: Function;
    };
  } = {};
  store: S;
  listener: Array<Function> = [];
  constructor(s: S) {
    this.store = s;
    this.getStore = this.getStore.bind(this);
    this._getModule = this._getModule.bind(this);
    this.dispatch = (this.dispatch as any).bind(this);
    this.watch = this.watch.bind(this);
    this.destroy = this.destroy.bind(this);
  }
  protected async dispatch<
    MN extends Extract<keyof ST, string>,
    AN extends Extract<keyof ST[MN]["actions"], string>
  >(
    moduleName: MN,
    actionName: AN,
    ...arg: Parameters<ST[MN]["actions"][AN]>
  ): Promise<ReturnType<ST[MN]["actions"][AN]>> {
    const store = this.getStore();
    if (store === undefined) {
      throw new Error("natur-service: store is undefined!");
    }
    const type = `${moduleName}/${actionName}`;
    if (store.hasModule(moduleName)) {
      return store.dispatch(moduleName, actionName, ...arg);
    } else {
      if (!this.dispatchPromise[type]) {
        this.dispatchPromise[type] = {
          value: undefined,
          cancel: () => {},
        };
      }
      if (!!this.dispatchPromise[type].value) {
        this.dispatchPromise[type].cancel();
      }
      this.dispatchPromise[type].value = new Promise<void>(
        (resolve, reject) => {
          const unsub = store.subscribe(moduleName, () => {
            unsub();
            resolve();
          });
          this.dispatchPromise[type].cancel = () => {
            reject({
              code: STOP_THE_LAST_DISPATCH_CODE,
              message: "stop the last dispatch!",
            });
            unsub();
          };
        }
      ).then(() => store.dispatch(moduleName, actionName, ...arg));

      return this.dispatchPromise[type].value;
    }
  }

  private _getModule<M extends keyof ST>(moduleName: M) {
    const store = this.getStore();
    if (store === undefined) {
      throw new Error("natur-service: store is undefined!");
    }
    if (!store.hasModule(moduleName as string)) {
      return undefined;
    }
    return store.getModule(moduleName as string);
  }

  protected getStore(): S {
    return this.store;
  }
  protected async watch<MN extends keyof ST>(
    moduleName: MN,
    watcher: <T extends ModuleEventType>(
      me: ServiceListenerParamsTypeMap<ST, MN>[T]
    ) => any
  ) {
    /**
     * 在store的模块中，又可能引入service模块，
     * 在service模块构造函数中，一般会调用watch方法，但是store有可能为初始化完成，
     * 所以将watch放在promise队列中
     */
    await Promise.resolve();
    const store = this.getStore();
    if (store === undefined) {
      throw new Error("natur-service: store is undefined!");
    }
    const { _getModule } = this;
    let oldModule = _getModule(moduleName);
    const unwatch = store.subscribe(moduleName as any, (me) => {
      const newModule = _getModule(moduleName);
      watcher({
        ...me,
        state: (newModule as any)?.state,
        oldModule,
        newModule,
      } as any);
      oldModule = newModule;
    });
    const destroyWatch = () => {
      oldModule = undefined;
      unwatch();
    };
    this.listener.push(destroyWatch);
  }
  /**
   * when the data of sourceModule changes and the data of sourceModule is different from the data of targetModule, synchronize the data of sourceModule to targetModule
   * @param sourceModuleName
   * @param targetModuleName
   * @param sourceModuleKeyPath key path of sourceModule's data (state and maps data)
   * @param targetModuleStateKeyPath key path of targetModule's state
   * @example
   * this.watchAndSyncDataByStateKey('sourceModuleName', 'targetModuleName', 'state.dataName', 'sourceDataName')
   */
  watchAndSyncDataByKeyPath<
    SMN extends keyof ST,
    TMN extends Exclude<keyof ST, SMN>,
    SKP extends ObjKeyPaths<Pick<ST[SMN], "state" | "maps">>,
	TSKP extends ObjKeyPaths<ST[TMN]['state']>
  >(
    sourceModuleName: SMN,
    targetModuleName: TMN,
    sourceModuleKeyPath: SKP,
    targetModuleStateKeyPath?: TSKP
  ) {
    this.watch(sourceModuleName, () => {
      this.syncDataByKeyPath(sourceModuleName, targetModuleName, sourceModuleKeyPath, targetModuleStateKeyPath);
    });
  }
  /**
   * synchronize the data of sourceModule to targetModule, when the data of sourceModule is different from the data of targetModule
   * @param sourceModuleName
   * @param targetModuleName
   * @param sourceModuleKeyPath key path of sourceModule's data (state and maps data)
   * @param targetModuleStateKeyPath key path of targetModule's state 
   * @example
   * this.watchAndSyncDataByStateKey('sourceModuleName', 'targetModuleName', 'state.dataName', 'sourceDataName')
   */
  syncDataByKeyPath<
	SMN extends keyof ST,
	TMN extends Exclude<keyof ST, SMN>,
	SKP extends ObjKeyPaths<Pick<ST[SMN], "state" | "maps">>,
	TSKP extends ObjKeyPaths<ST[TMN]['state']>
  >(
    sourceModuleName: SMN,
    targetModuleName: TMN,
    sourceModuleKeyPath: SKP,
    targetModuleStateKeyPath?: TSKP
  ) {
    try {
      const sourceModule = this.store.getModule(sourceModuleName as string);
      const targetModule = this.store.getModule(targetModuleName as string);
      if (sourceModule?.state) {
        const sourceData = getValueFromObjByKeyPath(
          sourceModule,
          sourceModuleKeyPath as any
        );
        const targetData = targetModuleStateKeyPath === undefined ? targetModule.state : getValueFromObjByKeyPath(
          targetModule.state,
          targetModuleStateKeyPath as any
        );
		const newTargetModuleState = targetModuleStateKeyPath === undefined ? sourceData : setValueFromObjByKeyPath(
			targetModule.state,
			targetModuleStateKeyPath as any,
			sourceData
		);
        if (sourceData !== targetData) {
          this.store.globalSetStates({
            [targetModuleName]: newTargetModuleState,
          } as any);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }
  destroy() {
    Object.keys(this.dispatchPromise).forEach((key) => {
      this.dispatchPromise[key].cancel();
      this.dispatchPromise[key].value = undefined;
      delete this.dispatchPromise[key];
    });
    this.store = null as any;
    this.listener.forEach((unSub) => unSub());
    this.listener = [];
  }
}
