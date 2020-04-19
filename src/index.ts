import { Store, Listener } from 'natur';

class NaturService {
	static store: Store;

	[mn:string]: any;

	listener: Array<Function> = [];

	getModule(moduleName: string, onUpdate?: Listener) {
		const {store} = NaturService;
		this.sub(moduleName, onUpdate);
		if (!store.hasModule(moduleName)) {
			this[moduleName] = undefined;
		} else {
			this[moduleName] = store.getModule(moduleName);
		}
	}

	sub(moduleName: string, onUpdate?: Listener) {
		this.listener.push(NaturService.store.subscribe(moduleName, (me) => {
			this[moduleName] = NaturService.store.getModule(moduleName);
			if (onUpdate) {
				onUpdate(me);
			}
		}));
	}

	destroy() {
		this.listener.forEach(unSub => unSub());
	}
}


export default NaturService;
