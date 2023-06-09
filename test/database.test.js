const {expect} = require('chai');
const mock = require('mock-fs');
const fs = require('fs');
const SimpleDatabase = require('../src/database');
const {encode} = require('../src/cipher');

const headerLength = 2;
const dir = '/test-db';
const entryType = 'test';

const testGetAll = () => {
  it('Returns an empty array if there are no entries yet', () => {
    const db = new SimpleDatabase(dir);
    expect(db.getAll(entryType)).to.deep.equal([]);
  });

  it('Throws error if file is corrupted', () => {
    fs.writeFileSync(`${dir}/${entryType}`, 'todolor');
    const db = new SimpleDatabase(dir);
    fs.writeFileSync(`${dir}/${entryType}`, encode(Buffer.from('todolor')));
    expect(() => db.getAll(entryType)).to.throw();
  });

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
    const db = new SimpleDatabase(dir);

    const idBuffer = Buffer.alloc(headerLength);
    idBuffer.writeUInt16BE(defaultHeader);
    const entityBuffer = Buffer.from('[{"hello:"world"}');
    const data = Buffer.concat([idBuffer, entityBuffer]);
    fs.writeFileSync(`${dir}/${entryType}`, encode(data));
    expect(() => db.getAll(entryType)).to.throw();
  });
};

const testAdd = () => {
  it('Successfully adds correct entities to an empty database', () => {
    const cases = [
      {'hello': 'world'},
      {'test': {'a': {'b': 'c'}}},
      {'hi': 'globe', 'number': 256},
    ];

    const db = new SimpleDatabase(dir);
    for (const testCase of cases) {
      db.add(entryType, testCase);
    }

    const entities = db.getAll(entryType);
    expect(entities).to.deep.equal(cases.map((e, idx) => {
      const clone = Object.assign({}, e);
      clone['id'] = idx;
      return clone;
    }));
  });

  it('Fails if entities\' end values aren\'t strings or numbers', () => {
    const cases = [
      {'hello': mock},
      {'test': {'a': {'b': encode}}},
      {'hi': 'globe', 'number': fs},
    ];

    const db = new SimpleDatabase(dir);
    for (const testCase of cases) {
      expect(() => db.add(entryType, testCase)).to.throw();
    }
  });

  it('Fails if ID count exceeds max value', () => {
    const db = new SimpleDatabase(dir);

    const idBuffer = Buffer.alloc(headerLength);
    // Max uint16
    idBuffer.writeUInt16BE(2 ** 16 - 1);
    const entityBuffer = Buffer.from('[]');
    const data = Buffer.concat([idBuffer, entityBuffer]);
    fs.writeFileSync(`${dir}/${entryType}`, encode(data));
    const entry = {'hello': 'world'};
    expect(() => db.add(entryType, entry)).to.throw('ID counter overflow');
  });
};

const testEdit = () => {
  it('Fails if an entity is incorrect', () => {
    const cases = [
      // No ID - no idea what is edited
      {'hello': 'globe'},
      {'hello': mock, 'id': 0},
      // There can't be an entity with such id
      {'hello': 'world', 'id': 256},
    ];
    const db = new SimpleDatabase(dir);
    db.add(entryType, {'hello': 'world'});
    for (const testCase of cases) {
      expect(() => db.edit(entryType, testCase)).to.throw();
    }
  });

  it('Successfully both adds and edits key-values pairs', () => {
    const db = new SimpleDatabase(dir);
    const toEdit = {'hello': 'world', 'touch': 'me'};
    const id = db.add(entryType, toEdit);
    const editId = db.edit(entryType, {
      'touch': 'forbidden',
      'new': 'value',
      'id': id,
    });
    expect(id).to.equal(0).to.equal(editId);
    const edited = db.getAll(entryType)[0];
    expect(edited).to.deep.equal({
      // Old values don't vanish
      'hello': 'world',
      // The needed ones are updated
      'touch': 'forbidden',
      // New ones are added
      'new': 'value',
      // Index stays the same
      'id': id,
    });
  });
};

const testDelete = () => {
  it('Fails if there is no such id', () => {
    const db = new SimpleDatabase(dir);
    expect(() => db.delete(entryType, 0)).to.throw();
    db.add(entryType, {'hello': 'world'});
    expect(() => db.delete(entryType, 1)).to.throw();
  });

  it('Successfully deletes entities', () => {
    const db = new SimpleDatabase(dir);
    const sampleEntity = {'hello': 'world'};
    const caseCount = 5;
    for (let i = 0; i < caseCount; i++) {
      db.add(entryType, sampleEntity);
    }
    expect(db.getAll(entryType).length).to.equal(caseCount);
    db.delete(entryType, 0);
    // That's ID, not index, so the function shouldn't throw
    expect(() => db.delete(entryType, caseCount - 1)).to.not.throw();
    expect(db.getAll(entryType).length).to.equal(caseCount - 2);
  });
};

const initMock = () => {
  const fsConfig = {};
  fsConfig[dir] = {};
  mock(fsConfig);
};

const restoreMock = () => mock.restore();

describe('SimpleDatabase', () => {
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

  const testMethod = (name, fn) => {
    describe(name, () => {
      beforeEach(() => initMock(dir));
      fn();
      afterEach(restoreMock);
    });
  };

  testMethod('getAll(type)', testGetAll);
  testMethod('add(type, entity)', testAdd);
  testMethod('edit(type, entity)', testEdit);
  testMethod('delete(type, id)', testDelete);
});
