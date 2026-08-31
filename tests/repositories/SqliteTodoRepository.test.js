const sqlite3 = require('sqlite3');
const SqliteTodoRepository = require('../../src/repositories/SqliteTodoRepository');
const Todo = require('../../src/domain/entities/Todo');

describe('SqliteTodoRepository', () => {
  let db;
  let repository;

  beforeEach(async () => {
    // Create connection to in-memory database
    db = new sqlite3.Database(':memory:');
    repository = await SqliteTodoRepository.init(db);
  });

  afterEach((done) => {
    db.close(done);
  });

  it('should save and find a todo', async () => {
    const todo = new Todo({ id: '1', title: 'Learn SQLite' });
    await repository.save(todo);

    const found = await repository.findById('1');
    expect(found).toBeDefined();
    expect(found.id).toBe('1');
    expect(found.title).toBe('Learn SQLite');
    expect(found.completed).toBe(false);
    expect(found.createdAt).toBeInstanceOf(Date);
  });

  it('should return null if todo is not found', async () => {
    const found = await repository.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should list all saved todos', async () => {
    const todo1 = new Todo({ id: '1', title: 'Task 1' });
    const todo2 = new Todo({ id: '2', title: 'Task 2', completed: true });

    await repository.save(todo1);
    await repository.save(todo2);

    const list = await repository.findAll();
    expect(list).toHaveLength(2);

    const titles = list.map(t => t.title);
    expect(titles).toContain('Task 1');
    expect(titles).toContain('Task 2');

    const t2 = list.find(t => t.id === '2');
    expect(t2.completed).toBe(true);
  });

  it('should delete a todo and return true if existed', async () => {
    const todo = new Todo({ id: '1', title: 'Task to delete' });
    await repository.save(todo);

    const deleted = await repository.delete('1');
    expect(deleted).toBe(true);

    const found = await repository.findById('1');
    expect(found).toBeNull();
  });

  it('should return false when deleting non-existent todo', async () => {
    const deleted = await repository.delete('non-existent');
    expect(deleted).toBe(false);
  });
});

describe('SqliteTodoRepository (error paths)', () => {
  it('should reject init when table creation fails', async () => {
    const fakeDb = { run: (sql, cb) => cb(new Error('create table failed')) };
    await expect(SqliteTodoRepository.init(fakeDb)).rejects.toThrow('create table failed');
  });

  it('should reject save when the statement fails', async () => {
    const fakeDb = {
      prepare: () => ({
        run: (id, title, completed, createdAt, cb) => cb(new Error('save failed')),
        finalize: () => {}
      })
    };
    const repository = new SqliteTodoRepository(fakeDb);
    const todo = new Todo({ id: '1', title: 'Task' });

    await expect(repository.save(todo)).rejects.toThrow('save failed');
  });

  it('should reject findById when the query fails', async () => {
    const fakeDb = { get: (sql, params, cb) => cb(new Error('findById failed')) };
    const repository = new SqliteTodoRepository(fakeDb);

    await expect(repository.findById('1')).rejects.toThrow('findById failed');
  });

  it('should reject findAll when the query fails', async () => {
    const fakeDb = { all: (sql, params, cb) => cb(new Error('findAll failed')) };
    const repository = new SqliteTodoRepository(fakeDb);

    await expect(repository.findAll()).rejects.toThrow('findAll failed');
  });

  it('should reject delete when the query fails', async () => {
    const fakeDb = { run: (sql, params, cb) => cb(new Error('delete failed')) };
    const repository = new SqliteTodoRepository(fakeDb);

    await expect(repository.delete('1')).rejects.toThrow('delete failed');
  });
});
