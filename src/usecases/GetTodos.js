class GetTodos {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute() {
    return await this.todoRepository.findAll();
  }
}

module.exports = GetTodos;
