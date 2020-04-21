import { Store, InjectStoreModule, ModuleEvent, State } from 'natur';


// type ModuleEvent = ;

type ServiceListenerParams = ModuleEvent & {
	oldModule: InjectStoreModule,
	newModule: InjectStoreModule,
	state: State
}

type ServiceListener = (me: ServiceListenerParams ) => any;

class NaturService {
	static store: Store;

	[mn:string]: any;

	protected listener: Array<Function> = [];

	protected getModule(moduleName: string, onUpdate?: ServiceListener) {
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

	protected sub(moduleName: string, onUpdate?: ServiceListener) {
		this.listener.push(NaturService.store.subscribe(moduleName, (me) => {
			const oldModule = this[moduleName];
			this._getModule(moduleName);
			const newModule = this[moduleName];
			if (onUpdate) {
				onUpdate({
					...me,
					oldModule,
					newModule,
					state: newModule.state,
				});
			}
		}));
	}

	destroy() {
		this.listener.forEach(unSub => unSub());
	}
}


export default NaturService;
