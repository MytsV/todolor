const foo = require('../src/foo');
const {expect} = require('chai');

describe('foo(a, b)', () => {
  it('Adds two numbers together', () => {
    expect(foo(1, 1)).to.equal(2);
  });
});
