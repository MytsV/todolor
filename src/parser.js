const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const moment = require('moment');

const errorMsg = {
  ID_LENGTH: 'ID must be a string with a length of 16',
  DATE_FMT: 'Invalid date. Provide a date in YYYY-MM-DD HH:MM:SS format.',
  OPTION_AMOUNT: 'At least one option is required',
  EMPTY_REQ: 'Empty request. Please input a command',
};

const arg = yargs(hideBin(process.argv))
    .command('ls', 'Output the list of tasks', (yargs) => {
      yargs
          .group(['due', 'overdue', 'completed'], 'Filter Options:')
          .option('due', {
            describe: 'Filter tasks to show only pending tasks',
            alias: 'd',
            type: 'boolean',
            conflicts: ['overdue', 'completed'],
          })
          .option('overdue', {
            describe: 'Filter tasks to show only overdue tasks',
            alias: 'o',
            type: 'boolean',
            conflicts: ['due', 'completed'],
          })
          .option('completed', {
            describe: 'Filter tasks to show only completed tasks',
            alias: 'c',
            type: 'boolean',
            conflicts: ['due', 'overdue'],
          })
          .strictOptions();
    }, function(arg) {
      // TODO: run the function
      console.log(arg);
    })
    .command('delete <id>', 'Delete task', (yargs) => {
      yargs.positional('id', {
        describe: 'task\'s ID',
        type: 'string',
        demandOption: true,
        coerce: (id) => {
          if (id.length !== 16) {
            throw new Error(errorMsg.ID_LENGTH);
          }
          return id;
        },
      });
    })
    .command('complete <id>', 'Complete task', (yargs) => {
      yargs.positional('id', {
        describe: 'task\'s ID',
        type: 'string',
        demandOption: true,
        coerce: (id) => {
          if (id.length !== 16) {
            throw new Error(errorMsg.ID_LENGTH);
          }
          return id;
        },
      });
    })
    .command('add', 'Add new task', (yargs) => {
      yargs
          .group(['name', 'desc', 'deadline'], 'Task Options:')
          .option('name', {
            describe: 'Name of the task',
            alias: 'n',
            type: 'string',
            demandOption: true,
          })
          .option('desc', {
            describe: 'Description of the task',
            alias: 'd',
            type: 'string',
            demandOption: true,
          })
          .option('deadline', {
            describe: 'Task\'s deadline',
            alias: 'l',
            type: 'data',
            demandOption: true,
            coerce: (deadline) => {
              const date = moment(deadline, 'YYYY-MM-DD HH:mm:ss', true);
              if (!date.isValid()) {
                throw new Error(errorMsg.DATE_FMT);
              }
              return date.format('YYYY-MM-DD HH:mm:ss');
            },
          })
          .strictOptions();
    })
    .command('edit <id>', 'Edit a task', (yargs) => {
      yargs
          .positional('id', {
            describe: 'task\'s hash index',
            type: 'string',
            demandOption: true,
            coerce: (id) => {
              if (id.length !== 16) {
                throw new Error(errorMsg.ID_LENGTH);
              }
              return id;
            },
          })
          .group(['name', 'desc', 'deadline'], 'Task Options:')
          .option('name', {
            describe: 'Name of the task',
            alias: 'n',
            type: 'string',
          })
          .option('desc', {
            describe: 'Description of the task',
            alias: 'd',
            type: 'string',
          })
          .option('deadline', {
            describe: 'Task\'s deadline',
            alias: 'l',
            type: 'date',
            coerce: (deadline) => {
              const date = moment(deadline, 'YYYY-MM-DD HH:mm:ss', true);
              if (!date.isValid()) {
                throw new Error(errorMsg.DATE_FMT);
              }
              return date.format('YYYY-MM-DD HH:mm:ss');
            },
          })
          .check((argv) => {
            if (!(argv.name || argv.desc || argv.deadline)) {
              throw new Error(errorMsg.OPTION_AMOUNT);
            }
            return true;
          });
    })
    .strict()
    .demandCommand(1, errorMsg.EMPTY_REQ)
    .help()
    .parse();

module.exports = arg;
