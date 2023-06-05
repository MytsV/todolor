const moment = require('moment');
const {dateFmt} = require('./format');

const outputTask = (task) => {
  // TODO: highlight completed tasks and output completion date
  console.log(`[${task.id}] ${task.title}`);
  if (task.description) {
    console.log(task.description);
  }
  if (task.deadline) {
    // TODO: highlight overdue tasks and display motivational quotes
    const date = moment(task.deadline);
    console.log(date.format(dateFmt));
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

// TODO: implement the rest of commands
const commands = {
  'ls': handleLs,
  'add': handleAdd,
};

module.exports = commands;
