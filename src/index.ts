import { Store, InjectStoreModule, ModuleEvent, State } from 'natur';


// type ModuleEvent = ;

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
	private moduleHasLoadPromise: {[mn: string]: Promise<any>} = {};
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
			if (!this.moduleHasLoadPromise[moduleName]) {
				this.moduleHasLoadPromise[moduleName] = new Promise((resolve) => {
					const unsub = store.subscribe(moduleName, ({type}) => {
						if (type === 'init') {
							unsub();
							resolve();
						}
					});
				});
			}
			return this.moduleHasLoadPromise[moduleName].then(() => store.dispatch(type, ...arg));
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
