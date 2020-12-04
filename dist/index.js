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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
// 停止上一次推送码
var STOP_THE_LAST_DISPATCH_CODE = 0;
var NaturService = /** @class */ (function () {
    function NaturService(s) {
        this.dispatchPromise = {};
        this.listener = [];
        this.store = s;
        this.getStore = this.getStore.bind(this);
        this._getModule = this._getModule.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.watch = this.watch.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    NaturService.prototype.dispatch = function (moduleName, actionName) {
        var arg = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            arg[_i - 2] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var store, type;
            var _this = this;
            return __generator(this, function (_a) {
                store = this.getStore();
                if (store === undefined) {
                    throw new Error('natur-service: store is undefined!');
                }
                type = moduleName + "/" + actionName;
                if (store.hasModule(moduleName)) {
                    return [2 /*return*/, store.dispatch.apply(store, __spreadArrays([moduleName, actionName], arg))];
                }
                else {
                    if (!this.dispatchPromise[type]) {
                        this.dispatchPromise[type] = {
                            value: undefined,
                            cancel: function () { }
                        };
                    }
                    if (!!this.dispatchPromise[type].value) {
                        this.dispatchPromise[type].cancel();
                    }
                    this.dispatchPromise[type].value = new Promise(function (resolve, reject) {
                        var unsub = store.subscribe(moduleName, function () {
                            unsub();
                            resolve();
                        });
                        _this.dispatchPromise[type].cancel = function () {
                            reject({
                                code: STOP_THE_LAST_DISPATCH_CODE,
                                message: 'stop the last dispatch!'
                            });
                            unsub();
                        };
                    })
                        .then(function () { return store.dispatch.apply(store, __spreadArrays([moduleName, actionName], arg)); });
                    return [2 /*return*/, this.dispatchPromise[type].value];
                }
                return [2 /*return*/];
            });
        });
    };
    NaturService.prototype._getModule = function (moduleName) {
        var store = this.getStore();
        if (store === undefined) {
            throw new Error('natur-service: store is undefined!');
        }
        if (!store.hasModule(moduleName)) {
            return undefined;
        }
        return store.getModule(moduleName);
    };
    NaturService.prototype.getStore = function () {
        return this.store;
    };
    NaturService.prototype.watch = function (moduleName, watcher) {
        return __awaiter(this, void 0, void 0, function () {
            var store, _getModule, oldModule, unwatch, destroyWatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    /**
                     * 在store的模块中，又可能引入service模块，
                     * 在service模块构造函数中，一般会调用watch方法，但是store有可能为初始化完成，
                     * 所以将watch放在promise队列中
                     */
                    return [4 /*yield*/, Promise.resolve()];
                    case 1:
                        /**
                         * 在store的模块中，又可能引入service模块，
                         * 在service模块构造函数中，一般会调用watch方法，但是store有可能为初始化完成，
                         * 所以将watch放在promise队列中
                         */
                        _a.sent();
                        store = this.getStore();
                        if (store === undefined) {
                            throw new Error('natur-service: store is undefined!');
                        }
                        _getModule = this._getModule;
                        oldModule = _getModule(moduleName);
                        unwatch = store.subscribe(moduleName, function (me) {
                            var _a;
                            var newModule = _getModule(moduleName);
                            watcher(__assign(__assign({}, me), { state: (_a = newModule) === null || _a === void 0 ? void 0 : _a.state, oldModule: oldModule,
                                newModule: newModule }));
                            oldModule = newModule;
                        });
                        destroyWatch = function () {
                            oldModule = undefined;
                            unwatch();
                        };
                        this.listener.push(destroyWatch);
                        return [2 /*return*/];
                }
            });
        });
    };
    NaturService.prototype.destroy = function () {
        var _this = this;
        Object.keys(this.dispatchPromise).forEach(function (key) {
            _this.dispatchPromise[key].cancel();
            _this.dispatchPromise[key].value = undefined;
            delete _this.dispatchPromise[key];
        });
        this.listener.forEach(function (unSub) { return unSub(); });
    };
    return NaturService;
}());
export default NaturService;
