import { Store, Listener } from 'natur';
declare class NaturService {
    static store: Store;
    [mn: string]: any;
    listener: Array<Function>;
    getModule(moduleName: string, onUpdate?: Listener): void;
    sub(moduleName: string, onUpdate?: Listener): void;
    destroy(): void;
}
export default NaturService;
