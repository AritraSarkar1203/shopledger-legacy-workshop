const test = require('node:test');
const assert = require('node:assert/strict');

const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

test('stock check allows purchasing the last sellable unit', () => {
  const products = [{ id: 1, name: 'Tea', stock: 1, reserved: 0 }];

  assert.deepEqual(inventory.getSellableStock(products[0]), 1);
  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 1 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: stock check accepts quantities below sellable stock and reserve deducts physical stock', () => {
  const products = [{ id: 1, name: 'Tea', stock: 3, reserved: 0 }];
  const items = [{ id: 1, qty: 2 }];

  assert.deepEqual(inventory.check(products, items), { ok: true });
  inventory.reserve(products, items);
  assert.equal(products[0].stock, 1);
  assert.equal(inventory.getSellableStock(products[0]), 1);
});

test('cancelling an order restores its stock by item id', () => {
  const products = [{ id: 1, name: 'Tea', stock: 1, reserved: 0 }];
  const db = {
    products,
    nextOrderId: 1002,
    orders: [{
      id: 1001,
      status: 'completed',
      paymentMode: 'cash',
      items: [{ id: 1, name: 'Tea', qty: 2 }],
      total: 20
    }]
  };

  const result = orders.cancel(db, 1001, 'Customer changed mind');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(result.order.cancelReason, 'Customer changed mind');
  assert.equal(products[0].stock, 3);
  assert.equal(products[0].reserved, 0);
});

test('releasing a cancelled order restores physical stock', () => {
  const products = [{ id: 1, name: 'Tea', stock: 5, reserved: 3 }];

  inventory.release(products, [{ id: 1, qty: 2 }]);
  assert.equal(products[0].stock, 7);
  assert.equal(products[0].reserved, 3);
});
