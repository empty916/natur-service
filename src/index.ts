import { Store } from 'natur';

class NaturService {
	static store: Store;

	[mn:string]: any;

	listener: Array<Function> = [];

	getModule(moduleName: string, onUpdate?: Function) {
		const {store} = NaturService;
		this.sub(moduleName, onUpdate);
		if (!store.getAllModuleName().includes(moduleName)) {
			throw new Error(`${moduleName} is invalid!`);
		}
		if (!store.hasModule(moduleName)) {
			this[moduleName] = undefined;
		} else {
			this[moduleName] = store.getModule(moduleName);
		}
	}

	sub(moduleName: string, onUpdate?: Function) {
		this.listener.push(NaturService.store.subscribe(moduleName, () => {
			this[moduleName] = NaturService.store.getModule(moduleName);
			if (onUpdate) {
				onUpdate();
			}
		}));
	}

	destroy() {
		this.listener.forEach(unSub => unSub());
	}
}


export default NaturService;
