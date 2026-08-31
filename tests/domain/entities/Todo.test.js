const Todo = require('../../../src/domain/entities/Todo');

describe('Todo Entity', () => {
  it('should create a valid Todo entity', () => {
    const todoData = {
      id: '1',
      title: 'Learn Clean Architecture',
      completed: false,
      createdAt: new Date('2026-08-29T00:00:00Z')
    };

    const todo = new Todo(todoData);

    expect(todo.id).toBe('1');
    expect(todo.title).toBe('Learn Clean Architecture');
    expect(todo.completed).toBe(false);
    expect(todo.createdAt).toEqual(new Date('2026-08-29T00:00:00Z'));
  });

  it('should trim the todo title', () => {
    const todo = new Todo({ id: '1', title: '   Clean Room   ' });
    expect(todo.title).toBe('Clean Room');
  });

  it('should throw an error if title is empty or spaces', () => {
    expect(() => new Todo({ id: '1', title: '' })).toThrow();
    expect(() => new Todo({ id: '1', title: '   ' })).toThrow();
  });

  it('should throw an error if title is not a string', () => {
    expect(() => new Todo({ id: '1', title: null })).toThrow();
    expect(() => new Todo({ id: '1', title: 123 })).toThrow();
  });

  it('should default completed status to false', () => {
    const todo = new Todo({ id: '1', title: 'Do laundry' });
    expect(todo.completed).toBe(false);
  });

  it('should default createdAt to a valid Date', () => {
    const todo = new Todo({ id: '1', title: 'Do laundry' });
    expect(todo.createdAt).toBeInstanceOf(Date);
  });

  it('should convert a non-Date createdAt value into a Date', () => {
    const todo = new Todo({ id: '1', title: 'Do laundry', createdAt: '2026-08-29T00:00:00Z' });
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.createdAt).toEqual(new Date('2026-08-29T00:00:00Z'));
  });

  it('should toggle completed status', () => {
    const todo = new Todo({ id: '1', title: 'Buy milk' });
    expect(todo.completed).toBe(false);

    todo.toggle();
    expect(todo.completed).toBe(true);

    todo.toggle();
    expect(todo.completed).toBe(false);
  });
});
