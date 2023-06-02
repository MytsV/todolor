const sinon = require('sinon');
const mock = require('mock-fs');
const {expect} = require('chai');

const os = require('os');
const fs = require('fs');
const {readConfig} = require('../src/config');

const unreadable = 0o000;
const corruptedMsg = 'Corrupted configuration file';

describe('readConfig()', () => {
  const homedir = '/home';

  beforeEach(() => {
    sinon.stub(os, 'homedir').returns(homedir);
  });

  it('Returns a valid configuration object if such file exists', () => {
    const dbPath = '/test/.todolor';

    const fsConfig = {};
    fsConfig[homedir] = {'.todolor.conf': `PATH=${dbPath}`};
    mock(fsConfig);

    const result = readConfig();
    expect(result.path).to.equal(dbPath);
  });

  it('Creates a new configuration file if one is absent', () => {
    const fsConfig = {};
    fsConfig[homedir] = {};
    mock(fsConfig);

    const result = readConfig();
    expect(result.path).to.equal(`${homedir}/.todolor`);
    expect(fs.existsSync(`${homedir}/.todolor.conf`)).to.be.true;
  });

  it('Fails if configuration file is invalid', () => {
    const fsConfig = {};
    fsConfig[homedir] = {'.todolor.conf': ''};
    mock(fsConfig);

    expect(() => readConfig()).to.throw(corruptedMsg);
  });

  it('Fails if home directory has restricted permissions', () => {
    mock({
      '/home': mock.directory({mode: unreadable}),
    });
    expect(() => readConfig()).to.throw();
  });

  it('Fails if configuration file has restricted permissions', () => {
    mock({
      '/home': {
        '.todolor.conf': mock.file({mode: unreadable}),
      },
    });
    expect(() => readConfig()).to.throw();
  });

  it('Correctly parses configuration content', () => {
    mock({
      '/home': {
        '.todolor.conf': '',
      },
    });

    const configPath = '/home/.todolor.conf';
    const createCase = (input, result) => {
      return {'input': input, 'result': result};
    };

    /*
     Configuration handler keeps a list of valid keys.
     PATH and DEBUG keys should always be valid.
     */
    const cases = [
      createCase('PATH=a', {'path': 'a'}),
      createCase('PATxH=a'),
      createCase('PATH=PATH=hello', {'path': 'PATH=hello'}),
      createCase('PATH=a\nDEBUG=b', {'path': 'a', 'debug': 'b'}),
      createCase('a\nPATH=b'),
      createCase('PATH=a\n', {'path': 'a'}),
    ];

    for (const testCase of cases) {
      fs.writeFileSync(configPath, testCase.input);
      if (!testCase.result) {
        expect(() => readConfig()).to.throw(corruptedMsg);
      } else {
        expect(readConfig()).to.deep.equal(testCase.result);
      }
    }
  });

  afterEach(() => {
    sinon.restore();
    mock.restore();
  });
});
