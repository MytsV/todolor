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
    readContent(path.join(this.dir, type));
    return [];
  }

  /**
   * Appends an entity of certain type
   * @param {string} type
   * @param {Map} entity
   */
  add(type, entity) {
    throw Error('Not implemented');
  }

  /**
   * Appends an entity of certain type
   * @param {string} type
   * @param {Map} entity
   */
  edit(type, entity) {
    throw Error('Not implemented');
  }
}

module.exports = {SimpleDatabase};
