var NaturService = /** @class */ (function () {
    function NaturService() {
        this.listener = [];
    }
    NaturService.prototype.getModule = function (moduleName, onUpdate) {
        var store = NaturService.store;
        this.sub(moduleName, onUpdate);
        if (!store.getAllModuleName().includes(moduleName)) {
            throw new Error(moduleName + " is invalid!");
        }
        if (!store.hasModule(moduleName)) {
            this[moduleName] = undefined;
        }
        else {
            this[moduleName] = store.getModule(moduleName);
        }
    };
    NaturService.prototype.sub = function (moduleName, onUpdate) {
        var _this = this;
        this.listener.push(NaturService.store.subscribe(moduleName, function () {
            _this[moduleName] = NaturService.store.getModule(moduleName);
            if (onUpdate) {
                onUpdate();
            }
        }));
    };
    NaturService.prototype.destroy = function () {
        this.listener.forEach(function (unSub) { return unSub(); });
    };
    return NaturService;
}());
export default NaturService;
