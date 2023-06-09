const fs = require('fs');
const {decode, encode} = require('./cipher');
const path = require('path');

// ID length in bytes
const idSize = 2;

const toBytes = (data) => {
  const idBuffer = Buffer.alloc(idSize);
  idBuffer.writeUInt16BE(data.lastIdx);
  // Write json string with default UTF-8 encoding
  const dataJson = JSON.stringify(data.entities);
  const dataBuffer = Buffer.from(dataJson);
  return Buffer.concat([idBuffer, dataBuffer]);
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
    const data = this.#retrieveData(type);
    return data.entities;
  }

  /**
   * Appends an entity of certain type
   * @param {string} type
   * @param {object} entity
   * @return {string | number}
   */
  add(type, entity) {
    if (!isEntityCorrect(entity)) {
      throw Error('Entity terminal values may be only strings or numbers');
    }
    const data = this.#retrieveData(type);
    if (data.lastIdx === idMax) {
      // TODO: reindexing operation to restore overflown database
      throw Error('ID counter overflow');
    }
    data.lastIdx = data.lastIdx !== undefined ? data.lastIdx + 1 : 0;
    const entityClone = Object.assign({}, entity);
    entityClone['id'] = data.lastIdx;
    data.entities.push(entityClone);

    this.#writeData(type, data);
    return data.lastIdx;
  }

  /**
   * Changes values of an entity of certain type
   * @param {string} type
   * @param {object} entity
   * @return {string | number}
   */
  edit(type, entity) {
    if (entity.id === undefined) {
      throw Error('Entity must have ID specified');
    }
    if (!isEntityCorrect(entity)) {
      throw Error('Entity terminal values may be only strings or numbers');
    }
    const data = this.#retrieveData(type);
    const editedEntity = data.entities.find((e) => e.id === entity.id);
    if (!editedEntity) {
      throw Error('Can\'t find the entity to edit');
    }
    Object.assign(editedEntity, entity);

    this.#writeData(type, data);
    return entity.id;
  }

  /**
   * Removes entity with {id} from database
   * @param {string} type
   * @param {string | number} id
   */
  delete(type, id) {
    const data = this.#retrieveData(type);
    const entityIdx = data.entities.findIndex((e) => e.id === id);
    if (entityIdx < 0) {
      throw Error('Can\'t find the entity to delete');
    }
    data.entities.splice(entityIdx, 1);

    this.#writeData(type, data);
  }

  /**
   * A shorthand for reading and parsing database content
   * @param {string} type
   * @return {object}
   */
  #retrieveData(type) {
    const typePath = path.join(this.dir, type);
    if (!fs.existsSync(typePath)) {
      fs.writeFileSync(typePath, '');
    }
    const result = fs.readFileSync(typePath);
    const decoded = decode(result);
    return parse(decoded);
  }

  /**
   * A shorthand for updating database content
   * @param {string} type
   * @param {object} data
   */
  #writeData(type, data) {
    const typePath = path.join(this.dir, type);
    fs.writeFileSync(typePath, encode(toBytes(data)));
  }
}

module.exports = SimpleDatabase;
