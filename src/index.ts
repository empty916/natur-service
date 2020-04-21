import { Store, Listener, InjectStoreModule, ModuleEvent } from 'natur';


// type ModuleEvent = ;

type ServiceListenerParams = ModuleEvent & {
	oldModule: InjectStoreModule,
	newModule: InjectStoreModule,
}

type ServiceListener = (me: ServiceListenerParams ) => any;

class NaturService {
	static store: Store;

	[mn:string]: any;

	private listener: Array<Function> = [];

	getModule(moduleName: string, onUpdate?: ServiceListener) {
		this.sub(moduleName, onUpdate);
		this._getModule(moduleName);
	}
	private _getModule(moduleName: string) {
		const {store} = NaturService;

		if (!store.hasModule(moduleName)) {
			this[moduleName] = undefined;
		} else {
			this[moduleName] = store.getModule(moduleName);
		}
	}

	private sub(moduleName: string, onUpdate?: ServiceListener) {
		this.listener.push(NaturService.store.subscribe(moduleName, (me) => {
			const oldModule = this[moduleName];
			this._getModule(moduleName);
			const newModule = this[moduleName];
			if (onUpdate) {
				onUpdate({
					...me,
					oldModule,
					newModule
				});
			}
		}));
	}

	destroy() {
		this.listener.forEach(unSub => unSub());
	}
}


export default NaturService;
