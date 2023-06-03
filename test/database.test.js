const {expect} = require('chai');
const mock = require('mock-fs');
const {SimpleDatabase} = require('../src/database');

describe('SimpleDatabase', () => {
  const dir = '/test-db';

  beforeEach(() => {
    const fsConfig = {};
    fsConfig[dir] = {};
    mock(fsConfig);
  });

  it('Successfully opens database in an existing directory', () => {
    expect(() => new SimpleDatabase(dir)).to.not.throw();
  });

  it('Fails on creation if database path is nonexistent', () => {
    expect(() => new SimpleDatabase('/test-absent')).to.throw();
  });

  it('If there are no entries yet, returns an empty array', () => {
    const entryType = 'task';
    const db = new SimpleDatabase(dir);
    expect(db.getAll(entryType)).to.deep.equal([]);
  });

  afterEach(() => {
    mock.restore();
  });
});
