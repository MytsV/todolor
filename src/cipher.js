// Doesn't care about what these bytes represent.
// Implemented not for data security, but protection from easy manipulation.

const byteSize = 256;
const key = 'todolor';

const rotate = (bytes, mul = 1) => {
  const result = Buffer.from(bytes);
  for (let i = 1; i <= bytes.length; i++) {
    const shift = key.charCodeAt(i % key.length);
    result[i - 1] = (bytes[i - 1] + shift * mul) % byteSize;
  }
  return result;
};

const encode = (bytes) => {
  return rotate(bytes);
};

const decode = (bytes) => {
  return rotate(bytes, -1);
};

module.exports = {encode, decode};
