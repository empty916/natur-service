import { setValueFromObjByKeyPath } from '../src/utils';


test('setValueFromObjByKeyPath', () => {
    expect(setValueFromObjByKeyPath({a: 1}, 'a', 2)).toEqual({a: 2});
    expect(setValueFromObjByKeyPath({a: {b: 1}}, 'a', 2)).toEqual({a: 2});
    expect(setValueFromObjByKeyPath({a: {b: 1}}, 'a.b', 2)).toEqual({a: {b: 2}});
    expect(setValueFromObjByKeyPath({a: {b: [1]}}, 'a.b.0', 2)).toEqual({a: {b: [2]}});
    expect(setValueFromObjByKeyPath({a: {b: [1,2]}}, 'a.b.length', 0)).toEqual({a: {b: []}});
})