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

type M = {
    count: typeof count;
    count2: typeof count;
};

let store = createStore({count, count2}, {});

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
    store = createStore({count, count2}, {});
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
