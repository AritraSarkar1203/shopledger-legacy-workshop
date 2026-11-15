const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');
const tax = require('../lib/tax');
const orders = require('../lib/orders');

test('CURRENT BEHAVIOUR: checkout applies HSN slab and taxes discounted taxable value', () => {
  const items = [{ id: 1, name: 'Rice', hsn: '1006', price: 600, qty: 1 }];
  const checkout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(checkout, {
    subtotal: 600,
    discount: 60,
    taxable: 540,
    tax: 27,
    cgst: 13.5,
    sgst: 13.5,
    total: 567,
    lines: [{
      id: 1, name: 'Rice', hsn: '1006', gstPercent: 5,
      gross: 600, discount: 60, taxable: 540, tax: 27, net: 567
    }]
  });
  assert.equal(tax.getRateForItem(items[0]), 0.05);
});

test('CURRENT BEHAVIOUR: invoice ignores HSN slab and taxes gross line before its coupon discount', () => {
  const order = {
    id: 1001,
    items: [{ id: 1, name: 'Rice', hsn: '1006', price: 600, qty: 1 }],
    coupon: 'SAVE10',
    total: 567
  };
  const figures = invoice.computeInvoiceFigures(order);

  assert.deepEqual(figures, {
    subtotal: 600,
    discount: 70.8,
    tax: 108,
    cgst: 54,
    sgst: 54,
    total: 637.2,
    rows: [{
      name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 600,
      gstPercent: 18, line: 600, lineTax: 108
    }]
  });
  assert.match(invoice.render(order), /differs from Order Ledger recorded total \(₹567\.00\) by \+₹70\.20/);
});

test('CURRENT BEHAVIOUR: invoice honors explicit gstRate as a percentage and splits rounded tax', () => {
  const figures = invoice.computeInvoiceFigures({
    items: [{ name: 'Ghee', hsn: '0405', price: 10, qty: 1, gstRate: 12 }]
  });

  assert.equal(figures.rows[0].gstPercent, 12);
  assert.equal(figures.tax, 1.2);
  assert.equal(figures.cgst, 0.6);
  assert.equal(figures.sgst, 0.6);
});

test('CURRENT BEHAVIOUR: order creation stores supplied totals and item fields without recalculation', () => {
  const db = { nextOrderId: 1001, orders: [] };
  const order = orders.add(db, {
    items: [{ id: 1, name: 'Rice', hsn: '1006', price: 600, qty: 1 }],
    subtotal: 600, discount: 60, tax: 27, total: 567
  });

  assert.equal(order.total, 567);
  assert.equal(order.tax, 27);
  assert.equal(order.items[0].gstRate, undefined);
  assert.equal(db.orders[0], order);
});
