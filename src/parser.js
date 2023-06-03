/* eslint-disable max-len */
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const moment = require('moment');

const arg = yargs(hideBin(process.argv))
    .command('ls', 'Outputs the list of tasks', (yargs) => {
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
    })
    .command('delete <id>', 'Delete task', (yargs) => {
      yargs.positional('id', {
        describe: 'task\'s hash index',
        type: 'string',
        demandOption: true,
        coerce: (id) => {
          if (id.length !== 16) {
            throw new Error('ID must be a string with a length of 10');
          }
          return id;
        },
      });
    })
    .command('complete <id>', 'Complete task', (yargs) => {
      yargs.positional('id', {
        describe: 'task\'s hash index',
        type: 'string',
        demandOption: true,
        coerce: (id) => {
          if (id.length !== 16) {
            throw new Error('ID must be a string with a length of 16');
          }
          return id;
        },
      });
    })
    .command('add', 'Add new task', (yargs) => {
      yargs
          .positional('id', {
            describe: 'task\'s hash index',
            type: 'string',
            demandOption: true,
            coerce: (id) => {
              if (id.length !== 16) {
                throw new Error('ID must be a string with a length of 16');
              }
              return id;
            },
          })
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
                throw new Error('Invalid deadline. Please provide a date in YYYY-MM-DD HH:MM:SS format.');
              }
              return date.format('YYYY-MM-DD HH:mm:ss');
            },
          })
          .strictOptions();
    })
    .command('edit <id>', 'Edit a task', (yargs) => {
      yargs
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
                throw new Error('Invalid deadline. Please provide a date in YYYY-MM-DD HH:MM:SS format.');
              }
              return date.format('YYYY-MM-DD HH:mm:ss');
            },
          })
          .check((argv) => {
            if (!(argv.name || argv.desc || argv.deadline)) {
              throw new Error('At least one option is required');
            }
            return true;
          });
    })
//    .strict()
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .parse();

console.log(arg);

module.exports = arg;
