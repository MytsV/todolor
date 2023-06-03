const cipher = require('../src/cipher');
const {expect} = require('chai');

const startPoint = 0x0;
const endPoint = 0x10FFFF;
const maxLength = 1024;

const getRandomString = () => {
  const length = Math.floor(Math.random() * maxLength);
  let result = '';
  for (let i = 0; i < length; i++) {
    const code = Math.floor(Math.random() * endPoint + startPoint);
    result += String.fromCharCode(code);
  }
  return result;
};

describe('cipher', () => {
  it('Correctly encodes and decodes any UTF-8 string', () => {
    const caseCount = 1024;
    for (let i = 0; i < caseCount; i++) {
      const testCase = getRandomString();
      const result = cipher.decode(cipher.encode(testCase));
      expect(result).to.equal(testCase);
    }
  });
});
