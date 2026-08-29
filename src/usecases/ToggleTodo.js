class ToggleTodo {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute({ id }) {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    todo.toggle();
    return await this.todoRepository.save(todo);
  }
}

module.exports = ToggleTodo;
