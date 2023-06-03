const {expect} = require('chai');
const mock = require('mock-fs');
const fs = require('fs');
const {SimpleDatabase} = require('../src/database');
const {encode} = require('../src/cipher');

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
      // Database files have int16 (big endian) header, which denotes ID counter
      const idxBuffer = Buffer.alloc(headerLength);
      idxBuffer.writeUInt16BE(0);
      const entityBuffer = Buffer.from(JSON.stringify(testCase));
      const data = Buffer.concat([idxBuffer, entityBuffer]);

      fs.writeFileSync(`${dir}/${entryType}`, encode(data));
      expect(db.getAll(entryType)).to.deep.equal(testCase);
    }
  });

  it('Fails if JSON data is incorrect', () => {
    const entryType = 'test';
    const db = new SimpleDatabase(dir);

    const idxBuffer = Buffer.alloc(headerLength);
    idxBuffer.writeUInt16BE(0);
    const entityBuffer = Buffer.from('[{"hello:"world"}');
    const data = Buffer.concat([idxBuffer, entityBuffer]);
    fs.writeFileSync(`${dir}/${entryType}`, encode(data));
    expect(() => db.getAll(entryType)).to.throw();
  });

  afterEach(() => {
    mock.restore();
  });
});
