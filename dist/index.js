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
var NaturService = /** @class */ (function () {
    function NaturService() {
        this.moduleHasLoadPromise = {};
        this.listener = [];
        if (!NaturService.store) {
            throw new Error('NaturService: store is not valid. you should bind store first!');
        }
        this.store = NaturService.store;
        this.getModule = this.getModule.bind(this);
        this._getModule = this._getModule.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.watch = this.watch.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    NaturService.prototype.getModule = function (moduleName) {
        this[moduleName] = this._getModule(moduleName);
    };
    NaturService.prototype._getModule = function (moduleName) {
        var store = this.store;
        if (!store.hasModule(moduleName)) {
            return undefined;
        }
        else {
            return store.getModule(moduleName);
        }
    };
    NaturService.prototype.dispatch = function (type) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var moduleName, store;
            return __generator(this, function (_a) {
                moduleName = type.split('/')[0];
                store = this.store;
                if (store.hasModule(moduleName)) {
                    return [2 /*return*/, store.dispatch.apply(store, __spreadArrays([type], arg))];
                }
                else {
                    if (!this.moduleHasLoadPromise[moduleName]) {
                        this.moduleHasLoadPromise[moduleName] = new Promise(function (resolve) {
                            var unsub = store.subscribe(moduleName, function (_a) {
                                var type = _a.type;
                                if (type === 'init') {
                                    unsub();
                                    resolve();
                                }
                            });
                        });
                    }
                    return [2 /*return*/, this.moduleHasLoadPromise[moduleName].then(function () { return store.dispatch.apply(store, __spreadArrays([type], arg)); })];
                }
                return [2 /*return*/];
            });
        });
    };
    NaturService.prototype.watch = function (moduleName, watcher) {
        var _a = this, store = _a.store, _getModule = _a._getModule;
        var oldModule = _getModule(moduleName);
        var unwatch = store.subscribe(moduleName, function (me) {
            var newModule = _getModule(moduleName);
            watcher(__assign(__assign({}, me), { state: newModule === null || newModule === void 0 ? void 0 : newModule.state, oldModule: oldModule,
                newModule: newModule }));
            oldModule = newModule;
        });
        var destroyWatch = function () {
            oldModule = undefined;
            unwatch();
        };
        this.listener.push(destroyWatch);
    };
    NaturService.prototype.destroy = function () {
        this.listener.forEach(function (unSub) { return unSub(); });
    };
    return NaturService;
}());
export default NaturService;
