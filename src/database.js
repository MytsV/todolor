const fs = require('fs');
const {decode, encode} = require('./cipher');
const path = require('path');

const readContent = (path) => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, '');
  }
  const result = fs.readFileSync(path);
  return decode(result);
};

const writeContent = (path, bytes) => {
  fs.writeFileSync(path, encode(bytes));
};

// ID length in bytes
const idSize = 2;

const toBytes = (data) => {
  const idBuffer = Buffer.alloc(idSize);
  idBuffer.writeUInt16BE(data.lastIdx);
  // Write json string with default UTF-8 encoding
  const jsonBuffer = Buffer.from(JSON.stringify(data.entities));
  return Buffer.concat([idBuffer, jsonBuffer]);
};

// Parses decoded database content into entities.
const parse = (bytes) => {
  if (bytes.length === 0) return {'entities': []};
  /*
   First two bytes represent ID counter, which is incremented on appending.
   It is stored in big endian format as unsigned int16.
   */
  const lastIdx = bytes.readUInt16BE();
  /*
   All other information is just a UTF-8 string with JSON data.
   Buffer.toString() uses UTF-8 encoding by default.
   */
  const info = bytes.subarray(idSize).toString();
  const entities = JSON.parse(info);
  if (!Array.isArray(entities)) {
    throw new SyntaxError();
  }
  return {
    lastIdx,
    'entities': entities,
  };
};

// Multiplying ID size in bytes by number of bits in a byte
const idMax = 2 ** (idSize * 8) - 1;

const isEntityCorrect = (entity) => {
  for (const value of Object.values(entity)) {
    if (typeof value === 'object') {
      if (!isEntityCorrect(value)) return false;
    } else if (typeof value !== 'string' && typeof value !== 'number') {
      return false;
    }
  }
  return true;
};

/** Implementation of single-file entity{key-value} storage */
class SimpleDatabase {
  /**
   * Initiates a database with files in {path} directory
   * @param {string} dir
   */
  constructor(dir) {
    if (!fs.existsSync(dir)) {
      throw new URIError('Provided path doesn\'t exist');
    }
    this.dir = dir;
  }

  /**
   * Returns an array of all entities with certain type
   * @param {string} type
   * @return {array}
   */
  getAll(type) {
    const documentPath = path.join(this.dir, type);
    const content = readContent(documentPath);
    const data = parse(content);
    return data.entities;
  }

  /**
   * Appends an entity of certain type
   * @param {string} type
   * @param {object} entity
   */
  add(type, entity) {
    if (!isEntityCorrect(entity)) {
      throw Error('Entity terminal values may be only strings or numbers');
    }
    const documentPath = path.join(this.dir, type);
    const content = readContent(documentPath);
    const data = parse(content);
    if (data.lastIdx === idMax) {
      // TODO: reindexing operation to restore overflown database
      throw Error('ID counter overflow');
    }
    data.lastIdx = data.lastIdx !== undefined ? data.lastIdx + 1 : 0;
    const entityClone = Object.assign({}, entity);
    entityClone['id'] = data.lastIdx;
    data.entities.push(entityClone);
    writeContent(documentPath, toBytes(data));
  }

  /**
   * Changes values of an entity of certain type
   * @param {string} type
   * @param {object} entity
   */
  edit(type, entity) {
    throw Error('Not implemented');
  }
}

module.exports = {SimpleDatabase, parse};
