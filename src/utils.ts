import { InjectStoreModules, ModuleEvent } from 'natur';

export { getValueFromObjByKeyPath } from 'natur/dist/utils';

// export const isNumber = (data: any): data is number => !Number.isNaN(Number(i))

export const setValueFromObjByKeyPath = <O extends {[p: string]: any}>(obj: O, keyPath: string, newValue: any): O | undefined => {
	const formatKeyArr = keyPath.replace(/\[/g, '.').replace(/\]/g, '').split('.');
	const res = {...obj};
	let value: any = res;
	for(let i = 0; i < formatKeyArr.length; i ++) {
		try {
			if (i === formatKeyArr.length - 1) {
				value[formatKeyArr[i]] = newValue;
				return res;
			} else {
				if (Array.isArray(value[formatKeyArr[i]])) {
					value[formatKeyArr[i]] = value[formatKeyArr[i]].slice();
				} else {
					value[formatKeyArr[i]] = {
						...value[formatKeyArr[i]]
					};
				}
				value = value[formatKeyArr[i]];
			}
		} catch (error) {
			console.error('natur-service sync data error: ', error);
			return undefined;
		}
	}
	return value;
}

export type ModuleEventType = ModuleEvent["type"];

export type ServiceListenerParamsTypeMap<
  StoreType extends InjectStoreModules,
  M extends keyof StoreType
> = {
  [t in ModuleEventType]: {
    type: t;
    actionName: t extends "update"
      ? keyof StoreType[M]["actions"] | "globalSetStates" | "globalResetStates"
      : undefined;
    oldModule: t extends "init" ? undefined : StoreType[M];
    newModule: t extends "remove" ? undefined : StoreType[M];
    state: t extends "remove" ? undefined : StoreType[M]["state"];
  };
};
