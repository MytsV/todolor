// I don't see a need in documenting the mock function
/* eslint-disable require-jsdoc */

const TaskController = require('../src/task_controller');
const {expect} = require('chai');

const entityType = 'task';

class MockDatabase {
  constructor() {
    this.idCounter = 0;
    this.tasks = [];
  }

  getAll(type) {
    if (type !== entityType) throw Error();
    return this.tasks;
  }

  add(type, entity) {
    if (type !== entityType) throw Error();
    const clone = Object.assign({}, entity);
    clone.id = this.idCounter;
    this.idCounter++;
    this.tasks.push(clone);
    return clone.id;
  }

  edit(type, entity) {
    if (type !== entityType) throw Error();
    if (entity.id === undefined) throw Error();
    const existing = this.tasks.find((e) => e.id === entity.id);
    Object.assign(existing, entity);
    return entity.id;
  }

  delete(type, id) {
    if (type !== entityType) throw Error();
    const idx = this.tasks.findIndex((e) => e.id === id);
    if (idx < 0) throw Error();
    this.tasks.splice(idx, 1);
  }
}

describe('TaskController', () => {
  describe('getAll()', () => {
    it('Correctly retrieves all data', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      const timestamp = new Date().getTime();
      // Add through db not to depend on other controller's methods
      db.add(entityType, {'title': 'hello', 'odd': 'value'});
      db.add(entityType, {'title': 'hi', 'completed': timestamp});
      expect(controller.getAll()).to.deep.equal([
        // Values which are not part of task are omitted
        {'title': 'hello', 'id': 0},
        {'title': 'hi', 'completed': timestamp, 'id': 1},
      ]);
    });

    it('Fails if database data is corrupted', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      // Title is required for a task
      db.add(entityType, {'hello': 'world'});
      expect(() => controller.getAll()).to.throw();
    });
  });

  describe('getDue()', () => {
    it('Retrieves only undone tasks and sorts them', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      // First timestamp is the closest
      const stamps = [];
      for (let i = 0; i < 3; i++) {
        stamps.push(new Date().getTime() + i);
      }
      const entities = [
        {'title': 'hello', 'completed': stamps[2], 'deadline': stamps[0]},
        {'title': 'hi', 'deadline': stamps[2]},
        {'title': 'привіт!', 'description': 'dolor...'},
        {'title': 'hello', 'completed': stamps[0]},
        {'title': 'hi', 'deadline': stamps[1]},
        {'title': 'hello', 'deadline': stamps[1]},
        {'title': '你好', 'deadline': stamps[2]},
        {'title': 'привіт!', 'deadline': stamps[0]},
        {'title': '你好'},
      ];
      for (const entity of entities) {
        db.add(entityType, entity);
      }
      // Set IDs, so we don't have to add them later
      entities.forEach((e, idx) => e.id = idx);
      expect(controller.getDue()).to.deep.equal([
        entities[7],
        entities[4],
        entities[5],
        entities[1],
        entities[6],
        entities[2],
        entities[8],
      ]);
    });
  });

  describe('complete(id)', () => {
    it('Correctly completes an existing task', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      db.add(entityType, {'title': 'hello'});
      controller.complete(0);
      expect(controller.getDue().length).to.equal(0);
      const tasks = controller.getAll();
      expect(tasks.length).to.equal(1);
      expect(tasks[0].completed).to.be.a('number');
    });

    it('Fails if a task is already completed', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      db.add(entityType, {'title': 'hello'});
      controller.complete(0);
      expect(() => controller.complete(0)).to.throw();
    });

    it('Fails if there is no such task', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      expect(() => controller.complete(0)).to.throw();
    });
  });

  describe('add(task)', () => {
    it('Successfully adds new tasks, excluding redundant fields', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      controller.add({'title': 'hello'});
      controller.add({'title': 'hi', 'remove': 'me'});
      expect(controller.getAll()).to.deep.equal([
        {'title': 'hello', 'id': 0},
        {'title': 'hi', 'id': 1},
      ]);
    });

    it('Fails if task data is incorrect', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      let task = {'hello': 'world'};
      expect(() => controller.add(task)).to.throw();
      task = {'title': 'hi', 'completed': new Date().getTime()};
      expect(() => controller.add(task)).to.throw();
    });
  });

  describe('edit(changes)', () => {
    it('Successfully edits a task', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      controller.add({'title': 'hello'});
      controller.edit({'title': 'hi', 'description': '!', 'id': 0});
      expect(controller.getAll()).to.deep.equal([
        {'title': 'hi', 'description': '!', 'id': 0},
      ]);
    });

    it('Fails if completion date is specified or if ID is wrong', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      controller.add({'title': 'hello'});
      let changes = {'completed': new Date().getTime(), 'id': 0};
      expect(() => controller.edit(changes)).to.throw();
      changes = {'id': 1, 'title': 'hi'};
      expect(() => controller.edit(changes)).to.throw();
    });
  });

  describe('getOverdue()', () => {
    it('Retrieves only overdue tasks and sorts them', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      const muchTime = 5000;
      const overdueFirst = new Date().getTime() - muchTime * 2;
      const overdueSecond = new Date().getTime() - muchTime;
      const due = new Date().getTime() + muchTime;
      const entities = [
        {'title': 'hello', 'completed': due, 'deadline': overdueFirst},
        {'title': 'hi', 'deadline': overdueFirst},
        {'title': 'привіт!', 'description': 'dolor...'},
        {'title': 'hi', 'deadline': due},
        {'title': 'hello', 'deadline': overdueSecond},
        {'title': 'привіт', 'deadline': overdueFirst},
      ];
      for (const entity of entities) {
        db.add(entityType, entity);
      }
      // Set IDs, so we don't have to add them later
      entities.forEach((e, idx) => e.id = idx);
      expect(controller.getOverdue()).to.deep.equal([
        entities[1],
        entities[5],
        entities[4],
      ]);
    });
  });

  describe('delete(id)', () => {
    it('Deletes an existing task', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      const id = controller.add({'title': 'hello'});
      expect(controller.getAll().length).to.equal(1);
      controller.delete(id);
      expect(controller.getAll().length).to.equal(0);
    });
  });

  describe('getCompleted()', () => {
    it('Retrieves only completed tasks and sorts them', () => {
      const db = new MockDatabase();
      const controller = new TaskController(db);
      const timestamp = new Date().getTime();
      const entities = [
        {'title': 'hello', 'completed': timestamp},
        {'title': 'hi', 'deadline': timestamp},
        {'title': 'привіт!', 'description': 'dolor...'},
        {'title': 'hi', 'completed': timestamp + 1},
        {'title': 'hello', 'completed': timestamp},
      ];
      for (const entity of entities) {
        db.add(entityType, entity);
      }
      // Set IDs, so we don't have to add them later
      entities.forEach((e, idx) => e.id = idx);
      expect(controller.getCompleted()).to.deep.equal([
        entities[3],
        entities[0],
        entities[4],
      ]);
    });
  });
});
