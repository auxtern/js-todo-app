const Todo = require('../domain/entities/Todo');

class CreateTodo {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute({ title }) {
    // Generate a simple ID.
    const id = Math.random().toString(36).substring(2, 9);
    const todo = new Todo({ id, title });
    return await this.todoRepository.save(todo);
  }
}

module.exports = CreateTodo;
