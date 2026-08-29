const DeleteTodo = require('../../src/usecases/DeleteTodo');
const InMemoryTodoRepository = require('../../src/repositories/InMemoryTodoRepository');
const Todo = require('../../src/domain/entities/Todo');

describe('DeleteTodo Use Case', () => {
  it('should delete a todo successfully', async () => {
    const repository = new InMemoryTodoRepository();
    const todo = new Todo({ id: '1', title: 'Task to delete' });
    await repository.save(todo);

    const useCase = new DeleteTodo(repository);
    const result = await useCase.execute({ id: '1' });

    expect(result).toBe(true);

    const saved = await repository.findById('1');
    expect(saved).toBeNull();
  });

  it('should throw an error if todo is not found', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodo(repository);

    await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow('Todo with ID non-existent not found');
  });
});
