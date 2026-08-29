const InMemoryTodoRepository = require('../../src/repositories/InMemoryTodoRepository');
const Todo = require('../../src/domain/entities/Todo');

describe('InMemoryTodoRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
  });

  it('should save and find a todo', async () => {
    const todo = new Todo({ id: '1', title: 'Learn Jest' });
    await repository.save(todo);

    const found = await repository.findById('1');
    expect(found).toBe(todo);
  });

  it('should return null if todo is not found', async () => {
    const found = await repository.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should list all saved todos', async () => {
    const todo1 = new Todo({ id: '1', title: 'Task 1' });
    const todo2 = new Todo({ id: '2', title: 'Task 2' });

    await repository.save(todo1);
    await repository.save(todo2);

    const list = await repository.findAll();
    expect(list).toHaveLength(2);
    expect(list).toContain(todo1);
    expect(list).toContain(todo2);
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
