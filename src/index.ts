import { InjectStoreModules, ModuleEvent } from 'natur';
import { _Store } from 'natur/dist/ts-utils';


// 停止上一次推送码
const STOP_THE_LAST_DISPATCH_CODE = 0;

type ModuleEventType = ModuleEvent['type'];

type ServiceListenerParamsTypeMap<StoreType extends InjectStoreModules, M extends keyof StoreType> = {
	[t in ModuleEventType]: {
		type: t;
		actionName: t extends 'update' ? keyof StoreType[M]['actions'] : undefined;
		oldModule: t extends 'init' ? undefined : StoreType[M];
		newModule: t extends 'remove' ? undefined : StoreType[M];
		state: t extends 'remove' ? undefined : StoreType[M]['state'];
	}
}


export default class NaturService<ST extends InjectStoreModules> {

	static storeGetter: () => _Store<any, any>;

	dispatchPromise: {[type: string]: {
		value: Promise<any> | undefined,
		cancel: Function,
	}} = {};

	listener: Array<Function> = [];
	constructor() {
		this._getModule = this._getModule.bind(this);
		this.dispatch = (this.dispatch as any).bind(this);
		this.watch = this.watch.bind(this);
		this.getStore = this.getStore.bind(this);
		this.destroy = this.destroy.bind(this);
	}
	protected async dispatch<
		MN extends keyof ST,
		AN extends keyof ST[MN]['actions'],
	>(moduleName: MN, actionName: AN, ...arg: Parameters<ST[MN]['actions'][AN]>): Promise<ReturnType<ST[MN]['actions'][AN]>> {
		const store = this.getStore();
		const type = `${moduleName}/${actionName}`;
		if (store.hasModule(moduleName as string)) {
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
			this.dispatchPromise[type].value = new Promise((resolve, reject) => {
				const unsub = store.subscribe(moduleName as keyof ST, () => {
					unsub();
					resolve();
				});
				this.dispatchPromise[type].cancel = () => {
					reject({
						code: STOP_THE_LAST_DISPATCH_CODE,
						message: 'stop the last dispath!'
					});
					unsub();
				};
			})
			.then(() => store.dispatch(moduleName, actionName, ...arg));

			return this.dispatchPromise[type].value;
		}
	}

	private _getModule<M extends keyof ST>(moduleName: M) {
		const store = this.getStore();
		if (!store.hasModule(moduleName as string)) {
			return undefined;
		}
		return store.getModule(moduleName as string);
	}

	protected getStore() {
		const store = NaturService.storeGetter() as _Store<ST, any>;
		if (!store) {
			throw new Error('NaturService: store is invalid!');
		}
		return store;
	}
	protected async watch<
		MN extends keyof ST,
	>(moduleName: MN, watcher: <T extends ModuleEventType>(me: ServiceListenerParamsTypeMap<ST, MN>[T]) => any) {
		/**
		 * 在store的模块中，又可能引入service模块，
		 * 在service模块构造函数中，一般会调用watch方法，但是store有可能为初始化完成，
		 * 所以将watch放在promise队列中
		 */
		await Promise.resolve();
		const store = this.getStore();
		const {_getModule} = this;
		let oldModule = _getModule(moduleName);
		const unwatch = store.subscribe(moduleName as any, (me) => {
			const newModule = _getModule(moduleName);
			watcher({
				...me,
				state: newModule?.state,
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
	destroy() {
		this.listener.forEach(unSub => unSub());
	}
}
