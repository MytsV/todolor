const os = require('os');
const path = require('path');
const fs = require('fs');

const configName = '.todolor.conf';
const defaultPath = '.todolor';

// TODO: Write a small util to paint text
const yellowAnsi = '\x1b[33m';
const defaultAnsi = '\x1b[39m';

const parse = (contents) => {
  // TODO: Rewrite without regexp
  const regExp = /PATH=(.*)/;
  const result = regExp.exec(contents);
  if (!result || result.length === 0) {
    throw Error('Corrupted configuration file');
  } else {
    return result[0];
  }
};

const createConfig = (configPath) => {
  const databasePath = path.join(os.homedir(), defaultPath);
  const entry = `PATH=${databasePath}`;
  fs.writeFileSync(configPath, entry);
  return databasePath;
};

const readConfig = () => {
  const configPath = path.join(os.homedir(), configName);
  let contents;
  try {
    contents = fs.readFileSync(configPath);
  } catch (e) {
    console.log(`${yellowAnsi}${configPath} not found${defaultAnsi}`);
    const result = createConfig(configPath);
    console.log(`${yellowAnsi}Initialized ${configPath}${defaultAnsi}`);
    return {path: result};
  }
  return {path: parse(contents)};
};

module.exports = {readConfig};
