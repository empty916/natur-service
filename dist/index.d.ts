import { Store } from 'natur';
declare class NaturService {
    static store: Store;
    [mn: string]: any;
    listener: Array<Function>;
    getModule(moduleName: string, onUpdate?: Function): void;
    sub(moduleName: string, onUpdate?: Function): void;
    destroy(): void;
}
export default NaturService;
