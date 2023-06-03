const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
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
//    .strict()
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .parse();

console.log(arg);

module.exports = arg;