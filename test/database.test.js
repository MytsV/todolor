const {expect} = require('chai');
const mock = require('mock-fs');
const fs = require('fs');
const {SimpleDatabase} = require('../src/database');
const {encode} = require('../src/cipher');

const testGetAll = (dir) => {
  it('Returns an empty array if there are no entries yet', () => {
    const entryType = 'test';
    const db = new SimpleDatabase(dir);
    expect(db.getAll(entryType)).to.deep.equal([]);
  });

  it('Throws error if file is corrupted', () => {
    const entryType = 'test';
    fs.writeFileSync(`${dir}/${entryType}`, 'todolor');
    const db = new SimpleDatabase(dir);
    fs.writeFileSync(`${dir}/${entryType}`, encode(Buffer.from('todolor')));
    expect(() => db.getAll(entryType)).to.throw();
  });

  const headerLength = 2;
  // Set ID counter to zero for these tests
  const defaultHeader = 0;

  it('Returns expected entries if file data is correct', () => {
    const cases = [
      [{'hello': 'world'}],
      [
        {
          'number': 1,
          'inside': {
            'case': 'rumors',
          },
        },
      ],
      [
        {'hello': 'world'},
        {'hi': '地球'},
        {'what\'s up': 'плането!'},
      ],
    ];

    const entryType = 'task';
    const db = new SimpleDatabase(dir);

    for (const testCase of cases) {
      // Database files have uint16 (big endian) header, denoting ID counter
      const idBuffer = Buffer.alloc(headerLength);
      idBuffer.writeUInt16BE(defaultHeader);
      const entityBuffer = Buffer.from(JSON.stringify(testCase));
      const data = Buffer.concat([idBuffer, entityBuffer]);

      fs.writeFileSync(`${dir}/${entryType}`, encode(data));
      expect(db.getAll(entryType)).to.deep.equal(testCase);
    }
  });

  it('Fails if JSON data is incorrect', () => {
    const entryType = 'test';
    const db = new SimpleDatabase(dir);

    const idBuffer = Buffer.alloc(headerLength);
    idBuffer.writeUInt16BE(defaultHeader);
    const entityBuffer = Buffer.from('[{"hello:"world"}');
    const data = Buffer.concat([idBuffer, entityBuffer]);
    fs.writeFileSync(`${dir}/${entryType}`, encode(data));
    expect(() => db.getAll(entryType)).to.throw();
  });
};

const initMock = (dir) => {
  const fsConfig = {};
  fsConfig[dir] = {};
  mock(fsConfig);
};

const restoreMock = () => mock.restore();

describe('SimpleDatabase', () => {
  const dir = '/test-db';

  beforeEach(() => initMock(dir));

  describe('new SimpleDatabase(dir)', () => {
    beforeEach(() => initMock(dir));
    it('Successfully opens database in an existing directory', () => {
      expect(() => new SimpleDatabase(dir)).to.not.throw();
    });

    it('Fails on creation if database path is nonexistent', () => {
      expect(() => new SimpleDatabase('/test-absent')).to.throw();
    });
    afterEach(restoreMock);
  });

  describe('getAll()', () => {
    beforeEach(() => initMock(dir));
    testGetAll(dir);
    afterEach(restoreMock);
  });
});
