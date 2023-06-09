const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const moment = require('moment');

const {dateFmt} = require('./format');
const idMax = 65536;

const idLength = `ID must be a number in the range from 0 to ${idMax}.`;
const invalidDateFmt = `Invalid date. Provide a date in the ${dateFmt} format.`;
const optionCount = 'At least one option is required.';
const emptyReq = 'Empty request. Please input a command.';
const emptyField = 'Empty filed. This field should not be empty.';

const idCheck = (id) => {
  if (isNaN(id) || id < 0 || id > idMax) {
    throw new Error(idLength);
  }

  return id;
};

const checkDate = (deadline) => {
  const date = moment(deadline, dateFmt, true);
  if (!date.isValid()) {
    throw new Error(invalidDateFmt);
  }

  return date.format(dateFmt);
};

const checkNameDesc = (str) => {
  if (str === '') {
    throw new Error(emptyField);
  }

  return str;
};

const parser = yargs(hideBin(process.argv));

const setLs = () => {
  parser.command('ls', 'Output the list of tasks', (yargs) => {
    yargs.group(['due', 'overdue', 'completed'], 'Filter Options:');

    yargs.option('due', {
      describe: 'Filter tasks to show only pending tasks',
      alias: 'd',
      type: 'boolean',
      conflicts: ['overdue', 'completed'],
    });

    yargs.option('overdue', {
      describe: 'Filter tasks to show only overdue tasks',
      alias: 'o',
      type: 'boolean',
      conflicts: ['due', 'completed'],
    });

    yargs.option('completed', {
      describe: 'Filter tasks to show only completed tasks',
      alias: 'c',
      type: 'boolean',
      conflicts: ['due', 'overdue'],
    });

    yargs.strictOptions();
  });
};

const setComplete = () => {
  parser.command('complete <id>', 'Complete task', (yargs) => {
    yargs.positional('id', {
      describe: 'task\'s ID',
      type: 'number',
      coerce: (id) => idCheck(id),
    });
  });
};

const setDelete = () => {
  parser.command('delete <id>', 'Delete task', (yargs) => {
    yargs.positional('id', {
      describe: 'task\'s ID',
      type: 'number',
      coerce: idCheck,
    });
  });
};

const setAdd = () => {
  parser.command('add', 'Add new task', (yargs) => {
    yargs.group(['name', 'desc', 'deadline'], 'Task Options:');

    yargs.option('name', {
      describe: 'Name of the task',
      alias: 'n',
      type: 'string',
      demandOption: true,
      coerce: checkNameDesc,
    });

    yargs.option('desc', {
      describe: 'Description of the task',
      alias: 'd',
      type: 'string',
      coerce: checkNameDesc,
    });

    yargs.option('deadline', {
      describe: 'Task\'s deadline',
      alias: 'l',
      coerce: checkDate,
    });

    yargs.strictOptions();
  });
};

const setEdit = () => {
  parser.command('edit <id>', 'Edit a task', (yargs) => {
    yargs.positional('id', {
      describe: 'task\'s hash index',
      type: 'number',
      coerce: idCheck,
    });

    yargs.group(['name', 'desc', 'deadline'], 'Task Options:');

    yargs.option('name', {
      describe: 'Name of the task',
      alias: 'n',
      type: 'string',
      coerce: checkNameDesc,
    });

    yargs.option('desc', {
      describe: 'Description of the task',
      alias: 'd',
      type: 'string',
      coerce: checkNameDesc,
    });

    yargs.option('deadline', {
      describe: 'Task\'s deadline',
      alias: 'l',
      coerce: checkDate,
    });

    yargs.check((parser) => {
      if (!(parser.name || parser.desc || parser.deadline)) {
        throw new Error(optionCount);
      }
      return true;
    });
  });
};

const parse = () => {
  setLs();
  setComplete();
  setDelete();
  setAdd();
  setEdit();

  parser.strict();
  parser.demandCommand(1, emptyReq);
  parser.help();

  return parser.parse();
};

module.exports = {parse};
