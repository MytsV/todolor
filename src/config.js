const os = require('os');
const path = require('path');
const fs = require('fs');

const configName = '.todolor.conf';
const defaultPath = '.todolor';

// TODO: Write a small util to paint text
const yellowAnsi = '\x1b[33m';
const defaultAnsi = '\x1b[39m';

// Keys which parser allows to be present in configuration file
const allowedKeys = ['path', 'debug'];

/*
Returns object containing all the key-value pairs from a configuration string.
The format is as follows:
- content can't be empty
- every non-empty line is a valid key separated by '=' from corresponding value
 */
const parse = (content) => {
  const errorMsg = 'Corrupted configuration file';
  // Discards empty configuration
  if (content.length === 0) throw Error(errorMsg);

  const result = {};

  const lines = content.split('\n');
  for (const line of lines) {
    // Skips empty lines
    if (line.length === 0) continue;

    const idx = line.indexOf('=');
    if (idx < 0) {
      throw Error(errorMsg);
    }
    const [key, value] = [line.slice(0, idx), line.slice(idx +1)];
    if (!allowedKeys.includes(key.toLowerCase())) {
      throw Error(errorMsg);
    }
    result[key.toLowerCase()] = value;
  }

  return result;
};

const createConfig = (configPath) => {
  const databasePath = path.join(os.homedir(), defaultPath);
  const entry = `PATH=${databasePath}`;
  fs.writeFileSync(configPath, entry);
  return databasePath;
};

const readConfig = () => {
  const configPath = path.join(os.homedir(), configName);
  let content;
  try {
    content = fs.readFileSync(configPath);
  } catch (e) {
    console.log(`${yellowAnsi}${configPath} not found${defaultAnsi}`);
    const result = createConfig(configPath);
    console.log(`${yellowAnsi}Initialized ${configPath}${defaultAnsi}`);
    return {path: result};
  }
  return parse(content.toString());
};

module.exports = {readConfig};
