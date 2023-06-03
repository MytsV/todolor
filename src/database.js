const fs = require('fs');
const {decode} = require('./cipher');
const path = require('path');

const readContent = (path) => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, '');
  }
  const result = fs.readFileSync(path);
  return decode(result);
};

// Parses decoded database content into entities.
const parse = (bytes) => {
  if (bytes.length === 0) return {'entities': []};
  /*
   First two bytes represent ID counter, which is incremented on appending.
   It is stored in big endian format as unsigned int16.
   */
  const lastIdx = bytes.readUInt16BE();
  // All other information is just a UTF-8 string with JSON data.
  const info = bytes.subarray(2).toString();
  const entities = JSON.parse(info);
  if (!Array.isArray(entities)) {
    throw new SyntaxError();
  }
  return {
    lastIdx,
    'entities': entities,
  };
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
    throw Error('Not implemented');
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
