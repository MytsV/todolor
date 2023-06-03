const error = (str) => `\x1b[31m${str}\x1b[39m`;
const warning = (str) => `\x1b[33m${str}\x1b[39m`;
const success = (str) => `\x1b[32m${str}\x1b[39m`;

module.exports = {error, warning, success};
