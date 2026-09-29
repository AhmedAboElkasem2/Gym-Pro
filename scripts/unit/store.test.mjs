import test from 'node:test';
import assert from 'node:assert/strict';

function memoryStorage(){
  const values=new Map();
  return {
    getItem(key){return values.has(key)?values.get(key):null},
    setItem(key,value){values.set(key,String(value))},
    removeItem(key){values.delete(key)},
    values
  };
}

test('store preserves the gympro-v2 compatibility contract and state identity', async () => {
  const storage=memoryStorage();
  globalThis.localStorage=storage;
  const store=await import('../../app/src/main/web-src/data/store.mjs?store-test');

  assert.equal(store.STORAGE_KEY,'gympro-v2');
  const identity=store.state;
  store.replaceState({
    routines: [],
    performance: {},
    history: [],
    settings: { unit:'kg', rest:180 },
    exerciseLog: {},
    records: {}
  });
  assert.equal(store.state,identity);
  assert.equal(store.state.schema,3);

  store.save();
  assert.ok(storage.values.has('gympro-v2'));
});
