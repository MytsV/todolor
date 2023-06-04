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
    const due = tasks.filter((e) => e.complete === undefined);
    due.sort((a, b) => {
      // Check in undefined, because what if we want to set deadline to 1970? :)
      if (a.deadline === undefined) {
        if (b.deadline === undefined) return 0;
        return 1;
      } else if (b.deadline === undefined) {
        return -1;
      }
      if (a.deadline < b.deadline) return -1;
      else if (a.deadline !== b.deadline) return 1;
      return 0;
    });
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
    if (task.complete) {
      throw Error('The task is already complete');
    }
    const now = new Date();
    const changes = {'id': task.id, 'complete': now.getTime()};
    return this.db.edit(type, changes);
  }
}

const taskKeys = ['id', 'title', 'description', 'deadline', 'complete'];

// const toEntity = (task) => {
//   const entity = {};
//   for (const key in task) {
//     if (!taskKeys.includes(key)) continue;
//     entity[key] = task[key];
//   }
//   return entity;
// };

const toTask = (entity) => {
  if (entity['id'] === undefined || !entity['title']) {
    throw Error('Some task entry is corrupted');
  }
  const task = {};
  for (const key in entity) {
    if (!taskKeys.includes(key)) continue;
    task[key] = entity[key];
  }
  return task;
};

module.exports = TaskController;
