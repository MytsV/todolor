#!/usr/bin/env node

const fs = require('fs');

const parser = require('./src/cli_parser');
const hl = require('./src/highlight');
const commands = require('./src/commands');

const SimpleDatabase = require('./src/database');
const TaskController = require('./src/task_controller');

const getCommand = (args) => {
  const commandName = args._;
  const command = commands[commandName];
  if (!command) {
    console.log(hl.error(`${args} isn\'t implemented`));
  }
  return command;
};

const getDatabase = () => {
  // TODO: user friendly error messages for config problems
  const config = require('./src/config').read();
  if (!config.path) {
    console.log(hl.error('User configuration has no PATH entry'));
  }
  if (!fs.existsSync(config.path)) {
    fs.mkdirSync(config.path);
  }

  return new SimpleDatabase(config.path);
};

const run = () => {
  const args = parser.parse();
  const command = getCommand(args);
  const db = getDatabase();
  const controller = new TaskController(db);
  try {
    command(args, controller);
  } catch (e) {
    console.log(hl.error(e));
  }
};

run();
