const cipher = require('../src/cipher');
const {expect} = require('chai');

const startPoint = 0x0;
// We test only regular characters, hence the low endPoint
const endPoint = 0x00D000;
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

const encoding = 'utf-8';

describe('cipher', () => {
  it('Correctly encodes and decodes any UTF-8 string', () => {
    const caseCount = 1024;
    for (let i = 0; i < caseCount; i++) {
      const testCase = getRandomString();
      const buffer = Buffer.from(testCase, encoding);
      const encoded = cipher.encode(buffer);
      const result = cipher.decode(encoded);
      expect(result).to.deep.equal(buffer);
      expect(result.toString(encoding)).to.equal(testCase);
    }
  });
});
