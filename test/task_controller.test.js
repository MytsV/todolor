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
    return this.idCounter;
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
      db.add(entityType, {'title': 'hi', 'complete': timestamp});
      expect(controller.getAll()).to.deep.equal([
        // Values which are not part of task are omitted
        {'title': 'hello', 'id': 0},
        {'title': 'hi', 'complete': timestamp, 'id': 1},
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
        {'title': 'hello', 'complete': stamps[2], 'deadline': stamps[0]},
        {'title': 'hi', 'deadline': stamps[2]},
        {'title': 'привіт!', 'description': 'dolor...'},
        {'title': 'hello', 'complete': stamps[0]},
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
      expect(tasks[0].complete).to.be.a('number');
    });

    it('Fails if a task is already complete', () => {
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
});
