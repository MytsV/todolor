const moment = require('moment');
const {dateFmt} = require('./format');
const hl = require('./highlight');

const quotes = [
  'Let\'s do it!',
  'If I can you can as well!',
  'Kill them with success and bury them with a smile.',
  'There\'s power in looking silly and not caring that you do.',
  'Doing nothing is very hard to do… you never know when you\'re finished.',
  'The best way to appreciate your job is to imagine yourself without one.',
  'Hard work never killed anybody, but why take a chance?',
  'I like work; it fascinates me. I can sit and look at it for hours.',
  'The only thing that ever sat its way to success was a hen.',
  'Time is an illusion. Lunchtime is doubly so.',
  'The reward for good work is more work.',
  'If you see this that means you\'re in trouble, my friend!',
  'Early to bed and early to rise probably indicates unskilled labor.',
];

const chooseQuote = (str) => {
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  return str[quoteIndex];
};

const outputTask = (task) => {
  const outLines = [`[${task.id}] ${task.title}`];
  let highlighter = (str) => str;
  let quote;

  if (task.description) {
    outLines.push(task.description);
  }
  if (task.deadline) {
    const date = moment(task.deadline);
    outLines.push(`deadline: ${date.format(dateFmt)}`);

    const now = new Date().getTime();
    const overdue = task.completed === undefined && task.deadline < now;
    if (overdue) {
      highlighter = hl.error;
      quote = chooseQuote(quotes);
    }
  }
  if (task.completed !== undefined) {
    highlighter = hl.success;
    const completionDate = moment(task.completed).format(dateFmt);
    outLines.push(`completed on: ${completionDate}`);
  }

  outLines.forEach((line) => console.log(highlighter(line)));
  if (quote) {
    console.log(quote);
  }
  console.log('');
};

const handleLs = (args, controller) => {
  let tasks;
  if (args.due) {
    tasks = controller.getDue();
  } else if (args.overdue) {
    tasks = controller.getOverdue();
  } else if (args.completed) {
    tasks = controller.getCompleted();
  } else {
    tasks = controller.getAll();
  }
  tasks.forEach((e) => outputTask(e));
};

const handleAdd = (args, controller) => {
  const task = {
    'title': args.name,
  };
  if (args.desc) {
    task['description'] = args.desc;
  }
  if (args.deadline) {
    const date = moment(args.deadline, dateFmt);
    task['deadline'] = date.valueOf();
  }
  const id = controller.add(task);
  console.log(`Added new task with ID ${id}`);
};

const handleDelete = (args, controller) => {
  controller.delete(args.id);
  console.log(`Deleted a task with ID ${args.id}`);
};

const handleComplete = (args, controller) => {
  controller.complete(args.id);
  console.log(`Completed a task with ID ${args.id}`);
};

const handleEdit = (args, controller) => {
  const task = {
    'id': args.id,
  };
  if (args.name) {
    task['title'] = args.name;
  }
  if (args.desc) {
    task['description'] = args.desc;
  }
  if (args.deadline) {
    const date = moment(args.deadline, dateFmt);
    task['deadline'] = date.valueOf();
  }
  const id = controller.edit(task);
  console.log(`Edited task with ID ${id}`);
};

const commands = {
  'ls': handleLs,
  'add': handleAdd,
  'delete': handleDelete,
  'complete': handleComplete,
  'edit': handleEdit,
};

module.exports = commands;
