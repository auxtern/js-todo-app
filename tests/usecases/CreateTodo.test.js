const CreateTodo = require('../../src/usecases/CreateTodo');
const InMemoryTodoRepository = require('../../src/repositories/InMemoryTodoRepository');

describe('CreateTodo Use Case', () => {
  it('should successfully create and save a new todo', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new CreateTodo(repository);

    const result = await useCase.execute({ title: 'Task from usecase' });

    expect(result.id).toBeDefined();
    expect(result.title).toBe('Task from usecase');
    expect(result.completed).toBe(false);

    const saved = await repository.findById(result.id);
    expect(saved).toBe(result);
  });
});
