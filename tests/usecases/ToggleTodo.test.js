const ToggleTodo = require('../../src/usecases/ToggleTodo');
const InMemoryTodoRepository = require('../../src/repositories/InMemoryTodoRepository');
const Todo = require('../../src/domain/entities/Todo');

describe('ToggleTodo Use Case', () => {
  it('should toggle a todo status successfully', async () => {
    const repository = new InMemoryTodoRepository();
    const todo = new Todo({ id: '1', title: 'Task to toggle' });
    await repository.save(todo);

    const useCase = new ToggleTodo(repository);
    const updated = await useCase.execute({ id: '1' });

    expect(updated.completed).toBe(true);

    const saved = await repository.findById('1');
    expect(saved.completed).toBe(true);
  });

  it('should throw an error if todo is not found', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodo(repository);

    await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow('Todo with ID non-existent not found');
  });
});
