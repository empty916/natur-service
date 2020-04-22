import { Store, InjectStoreModule, ModuleEvent, State } from 'natur';

type ServiceListenerParams = ModuleEvent & {
	oldModule: InjectStoreModule | undefined,
	newModule: InjectStoreModule | undefined,
	state: State
}

type ServiceListener = (me: ServiceListenerParams ) => any;

class NaturService {
	static store: Store;

	[mn:string]: any;
	protected store: Store;
	private dispatchPromise: {[type: string]: {
		value: Promise<any> | undefined,
		cancel: Function,
	}} = {};
	protected listener: Array<Function> = [];
	constructor() {
		if (!NaturService.store) {
			throw new Error('NaturService: store is not valid. you should bind store first!');
		}
		this.store = NaturService.store;
		this.getModule = this.getModule.bind(this);
		this._getModule = this._getModule.bind(this);
		this.dispatch = this.dispatch.bind(this);
		this.watch = this.watch.bind(this);
		this.destroy = this.destroy.bind(this);
	}
	protected getModule(moduleName: string) {
		this[moduleName] = this._getModule(moduleName);
		this.watch(moduleName, () => this[moduleName] = this._getModule(moduleName));
	}
	private _getModule(moduleName: string) {
		const {store} = this;
		if (!store.hasModule(moduleName)) {
			return undefined;
		} else {
			return store.getModule(moduleName);
		}
	}
	async dispatch(type: string, ...arg: any[]) {
		const moduleName = type.split('/')[0];
		const { store } = this;
		if (store.hasModule(moduleName)) {
			return store.dispatch(type, ...arg);
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
				const unsub = store.subscribe(moduleName, ({type}) => {
					unsub();
					if(type !== 'remove') {
						resolve();
					} else {
						reject();
					}
				});
				this.dispatchPromise[type].cancel = () => {
					reject();
					unsub();
				};
			})
			.then(() => store.dispatch(type, ...arg), () => {});
			return this.dispatchPromise[type].value;
		}
	}
	protected watch(moduleName: string, watcher: ServiceListener) {
		const {store, _getModule} = this;
		let oldModule = _getModule(moduleName);
		const unwatch = store.subscribe(moduleName, (me) => {
			const newModule = _getModule(moduleName);
			watcher({
				...me,
				state: newModule?.state,
				oldModule,
				newModule,
			});
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

export default NaturService;
