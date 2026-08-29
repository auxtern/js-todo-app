const GetTodos = require('../../src/usecases/GetTodos');
const InMemoryTodoRepository = require('../../src/repositories/InMemoryTodoRepository');
const Todo = require('../../src/domain/entities/Todo');

describe('GetTodos Use Case', () => {
  it('should return all todos from repository', async () => {
    const repository = new InMemoryTodoRepository();
    const todo1 = new Todo({ id: '1', title: 'Task 1' });
    const todo2 = new Todo({ id: '2', title: 'Task 2' });

    await repository.save(todo1);
    await repository.save(todo2);

    const useCase = new GetTodos(repository);
    const list = await useCase.execute();

    expect(list).toHaveLength(2);
    expect(list).toContain(todo1);
    expect(list).toContain(todo2);
  });
});
