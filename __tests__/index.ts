import { createStore } from 'natur';
import NaturService from '../src';


const count = {
    state: 0,
    actions: {
        update: (ns: number) => ns,
    },
    maps: {
        plus1: (s: number) => s + 1,
    }
};

const count2 = {
    state: 0,
    actions: {
        update: (ns: number) => ns,
    },
    maps: {
        plus1: (s: number) => s + 1,
    }
};

const count3 = {
    state: {
        value: 1,
        data: {
            a: 2,
            b: {
                d: 1,
            }
        }
    },
    actions: {
        update: (ns: number) => ({
            value: ns,
            data: {
                a: ns,
                b: {
                    d: ns,
                }
            }
        }),
    },
    maps: {
        plus1: (s: {value: number}) => s.value + 1,
    }
};

const count4 = {
    state: {
        value: 1,
        data: {
            a: 2,
            b: {
                d: 1,
            }
        }
    },
    actions: {
        update: (ns: number) => ({
            value: ns,
            data: {
                a: ns,
                b: {
                    d: ns,
                }
            }
        }),
    },
    maps: {
        plus1: (s: {value: number}) => s.value + 1,
    }
};


type M = {
    count: typeof count;
    count2: typeof count2;
    count3: typeof count3;
    count4: typeof count4;
};

let store = createStore({count, count2, count3, count4}, {});

const sleep = (time: number) => new Promise(res => setTimeout(res, time));

class BaseService extends NaturService<M, {}> {
    constructor(s: typeof store = store) {
        super(s);
        this.start();
    }
    start() {}
}


beforeEach(() => {
    store.destroy();
    store = createStore({count, count2, count3, count4}, {});
});

test('watch module init', async () => {
    let hasStarted = false;
    let watcherHasRun = false;
    class CountService extends BaseService {
        start() {
            hasStarted = true;
            expect(this.store).toBe(store);
            this.watch('count', ({actionName, state, type}) => {
                watcherHasRun = true;
                expect(type).toBe('init');
            });
        }
    }
    const cs = new CountService();
    await sleep(10);
    expect(hasStarted).toBe(true);
    store.setModule('count', count);
    return expect(watcherHasRun).toBe(true);
});


test('watch module remove', async () => {
    class CountService extends BaseService {
        start() {
            this.watch('count', ({actionName, state, type}) => {
                expect(type).toBe('remove');
            });
        }
    }
    const cs = new CountService();
    await sleep(10);
    store.removeModule('count');
});


test('watch module update', async () => {
    const newState = Math.random();
    const _oldCount = store.getModule('count');
    class CountService extends BaseService {
        start() {
            this.watch('count', ({
                type,
                actionName,
                state,
                oldModule,
                newModule,
            }) => {
                expect(type).toBe('update');
                expect(actionName).toBe('update');
                expect(state).toBe(newState);
                expect(oldModule).toEqual(_oldCount);
                expect(newModule).toEqual(store.getModule('count'));
            });
        }
    }
    const cs = new CountService();
    await sleep(10);
    store.dispatch('count', 'update', newState);
});



test('dispatch', async () => {
    let callTime = 0;
    class CountService extends BaseService {
        start() {
            this.watch('count', ({state}) => {
                callTime++;
                if (typeof state === 'number') {
                    this.dispatch('count2', 'update', state);
                }
            });
            this.watch('count2', ({state}) => {
                callTime++;
                expect(state).toBe(store.getModule('count').state);
            });
        }
    }
    const cs = new CountService();
    await sleep(10);
    store.dispatch('count', 'update', 1);
    store.dispatch('count', 'update', 2);
    // expect(callTime).toBe(2);
});



test('dispatch lazyModule', async () => {
    store.removeModule('count2');
    let callTime = 0;
    let dropOldDispatch = 0;
    class CountService extends BaseService {
        start() {
            this.watch('count', ({state}) => {
                if (typeof state === 'number') {
                    this.dispatch('count2', 'update', state);
                }
            });
            this.watch('count2', ({state, type}) => {
                if (type === 'update') {
                    expect(state).toBe(2);
                }
                callTime++;
            });
        }

        dispatch: NaturService<M, {}>['dispatch'] = (...arg) => {
            return super.dispatch(arg[0], arg[1], ...(arg as any).slice(2)).catch(e => {
                if (e?.code === 0) {
                    dropOldDispatch++;
                    return;
                }
                throw e;
            }) as any;
        }
    }
    const cs = new CountService();
    await sleep(10);
    store.dispatch('count', 'update', 1);
    store.dispatch('count', 'update', 2);
    store.setModule('count2', count2);
    await sleep(10);
    expect(callTime).toBe(2);
    expect(dropOldDispatch).toBe(1);
});

test('sync data', async () => {
    class CountService extends BaseService {
        start() {
            
        }
    }
    const cs = new CountService();
    await sleep(10);
    store.dispatch('count3', 'update' ,11);
    store.dispatch('count', 'update' ,11);
    cs.syncDataByKeyPath('count3', 'count4', 'state.value', 'data.a');
    cs.syncDataByKeyPath('count3', 'count4', 'state.value', 'data.b.d');
    cs.syncDataByKeyPath('count3', 'count4', 'maps.plus1', 'value');

    cs.syncDataByKeyPath('count', 'count2', 'state');
    await sleep(10);
    expect(store.getModule('count4').state.data.a).toBe(11);
    expect(store.getModule('count4').state.data.b.d).toBe(11);
    expect(store.getModule('count4').state.value).toBe(12);

    expect(store.getModule('count2').state).toBe(11);
})


test('watch sync data', async () => {
    class CountService extends BaseService {
        start() {
            this.watchAndSyncDataByKeyPath('count3', 'count4', 'state.value', 'data.a');
            this.watchAndSyncDataByKeyPath('count3', 'count4', 'maps.plus1', 'value');
            this.watchAndSyncDataByKeyPath('count', 'count2', 'state');
        }
    }
    const cs = new CountService();
    await sleep(10);
    store.dispatch('count3', 'update' ,11);
    store.dispatch('count', 'update' ,11);
    await sleep(10);
    expect(store.getModule('count4').state.data.a).toBe(11);
    expect(store.getModule('count4').state.value).toBe(12);
    expect(store.getModule('count2').state).toBe(11);
})

test('destroy', async () => {
    let callTime = 0;
    store.removeModule('count2');
    class CountService extends BaseService {
        start() {
            this.watch('count', ({state}) => {
                callTime++;
                state && this.dispatch('count2', 'update', state);
            });
            this.watch('count2', ({state}) => {
                callTime++;
            });
        }
        dispatch: NaturService<M, {}>['dispatch'] = (...arg) => {
            return super.dispatch(arg[0], arg[1], ...(arg as any).slice(2)).catch(e => {
                if (e?.code === 0) {
                    return;
                }
                throw e;
            }) as any;
        }
    }
    const cs = new CountService();
    await sleep(10);
    store.dispatch('count', 'update', 1);
    cs.destroy();
    store.dispatch('count', 'update', 2);
    store.dispatch('count2', 'update', 2);
    await sleep(10);
    expect(callTime).toBe(1);
});
