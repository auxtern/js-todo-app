const TodoRepository = require('./TodoRepository');

class InMemoryTodoRepository extends TodoRepository {
  constructor() {
    super();
    this.todos = new Map();
  }

  async save(todo) {
    this.todos.set(todo.id, todo);
    return todo;
  }

  async findById(id) {
    return this.todos.get(id) || null;
  }

  async findAll() {
    return Array.from(this.todos.values());
  }

  async delete(id) {
    const exists = this.todos.has(id);
    if (exists) {
      this.todos.delete(id);
    }
    return exists;
  }
}

module.exports = InMemoryTodoRepository;
