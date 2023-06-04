const type = 'task';

/** A mediator between database and user interface */
class TaskController {
  /**
   * Creates a controller with injected database dependency
   * @param {object} db - object of Database interface
   * */
  constructor(db) {
    this.db = db;
  }

  /**
   * Retrieves all tasks
   * @return {array}
   */
  getAll() {
    return this.db.getAll(type).map((e) => toTask(e));
  }

  /**
   * Retrieves all undone tasks in order of deadline closeness
   * @return {array}
   */
  getDue() {
    const tasks = this.db.getAll(type).map((e) => toTask(e));
    const due = tasks.filter((e) => e.completed === undefined);
    sortByDate(due);
    return due;
  }

  /**
   * Completes a task and returns updated ID
   * @param {string | number} id
   * @return {string | number}
   */
  complete(id) {
    const task = this.db.getAll(type).find((e) => e.id === id);
    if (task === undefined) {
      throw Error(`No task with ${id} exists`);
    }
    if (task.completed) {
      throw Error('The task is already completed');
    }
    const now = new Date();
    const changes = {'id': task.id, 'completed': now.getTime()};
    return this.db.edit(type, changes);
  }

  /**
   * Appends a task to database and returns new task ID
   * @param {object} task
   * @return {string | number}
   */
  add(task) {
    const entity = toEntity(task);
    if (entity.completed !== undefined) {
      throw Error('Cannot add an already completed task');
    }
    return this.db.add(type, entity);
  }

  /**
   * Edits a task's content, but not completion status
   * @param {object} changes
   * @return {string | number}
   */
  edit(changes) {
    const entity = toEntity(changes);
    if (entity.completed !== undefined) {
      throw Error('Cannot edit completion time or status');
    }
    return this.db.edit(type, entity);
  }

  /**
   * Retrieves all undone tasks with missed deadlines and sorts them
   * @return {array}
   */
  getOverdue() {
    const tasks = this.db.getAll(type).map((e) => toTask(e));
    const now = new Date().getTime();
    const overdue = tasks.filter((e) => {
      return e.completed === undefined &&
        e.deadline !== undefined &&
        e.deadline < now;
    });
    sortByDate(overdue);
    return overdue;
  }

  /**
   * Deletes a task with specified ID
   * @param {string | number} id
   */
  delete(id) {
    this.db.delete(type, id);
  }

  /**
   * Retrieves all completed tasks in order of their completion
   * @return {array}
   */
  getCompleted() {
    const tasks = this.db.getAll(type).map((e) => toTask(e));
    const res = tasks.filter((e) => e.completed !== undefined);
    sortByDate(res, 'completed', -1);
    return res;
  }
}

const taskKeys = ['id', 'title', 'description', 'deadline', 'completed'];

const toEntity = (task) => {
  if (!task.title) {
    throw Error('Task should contain a title');
  }
  const entity = {};
  for (const key in task) {
    if (!taskKeys.includes(key)) continue;
    entity[key] = task[key];
  }
  return entity;
};

const sortByDate = (tasks, key = 'deadline', order = 1) => {
  tasks.sort((a, b) => {
    // Check in undefined, because what if we want to set deadline to 1970? :)
    if (a[key] === undefined) {
      if (b[key] === undefined) return 0;
      return order;
    } else if (b[key] === undefined) {
      return -order;
    }
    if (a[key] < b[key]) return -order;
    else if (a[key] !== b[key]) return order;
    return 0;
  });
};

const toTask = (entity) => {
  if (entity.id === undefined || !entity.title) {
    throw Error('A task entry is corrupted');
  }
  const task = {};
  for (const key in entity) {
    if (!taskKeys.includes(key)) continue;
    task[key] = entity[key];
  }
  return task;
};

module.exports = TaskController;
