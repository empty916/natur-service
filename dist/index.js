var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var NaturService = /** @class */ (function () {
    function NaturService() {
        this.listener = [];
    }
    NaturService.prototype.getModule = function (moduleName, onUpdate) {
        this.sub(moduleName, onUpdate);
        this._getModule(moduleName);
    };
    NaturService.prototype._getModule = function (moduleName) {
        var store = NaturService.store;
        if (!store.hasModule(moduleName)) {
            this[moduleName] = undefined;
        }
        else {
            this[moduleName] = store.getModule(moduleName);
        }
    };
    NaturService.prototype.sub = function (moduleName, onUpdate) {
        var _this = this;
        this.listener.push(NaturService.store.subscribe(moduleName, function (me) {
            var oldModule = _this[moduleName];
            _this._getModule(moduleName);
            var newModule = _this[moduleName];
            if (onUpdate) {
                onUpdate(__assign(__assign({}, me), { oldModule: oldModule,
                    newModule: newModule }));
            }
        }));
    };
    NaturService.prototype.destroy = function () {
        this.listener.forEach(function (unSub) { return unSub(); });
    };
    return NaturService;
}());
export default NaturService;
