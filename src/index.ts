import { Store } from 'natur';

class NaturService {
	static store: Store;

	[mn:string]: any;

	listener: Array<Function> = [];

	getModule(moduleName: string, onUpdate?: Function) {
		const {store} = NaturService;
		if (!store.hasModule(moduleName)) {
			throw new Error(`${moduleName} is invalid!`);
		}
		this.sub(moduleName, onUpdate);
		this[moduleName] = NaturService.store.getModule(moduleName);
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
