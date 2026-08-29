class DeleteTodo {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute({ id }) {
    const deleted = await this.todoRepository.delete(id);
    if (!deleted) {
      throw new Error(`Todo with ID ${id} not found`);
    }
    return true;
  }
}

module.exports = DeleteTodo;
