const moment = require('moment');
const {dateFmt} = require('./format');
const hl = require('./highlight');

const outputTask = (task) => {
  const output = (str) => console.log(str);
  const out = {
    head: `[${task.id}] ${task.title}`,
  };

  if (task.description) {
    out.desc = task.description;
  }
  if (task.deadline) {
    // TODO: highlight overdue tasks and display motivational quotes
    const date = moment(task.deadline);
    out.date = date.format(dateFmt);
  }
  if (task.completed !== undefined) {
    out.date = moment(task.completed).format(dateFmt);
    Object.keys(out).forEach((key) => {
      out[key] = hl.success(out[key]);
    });
  }

  Object.keys(out).forEach((key) => output(out[key]));
  output('');
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
