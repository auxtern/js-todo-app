class Todo {
  constructor({ id, title, completed = false, createdAt = new Date() }) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('Todo title is required and must be a non-empty string');
    }

    this.id = id;
    this.title = title.trim();
    this.completed = !!completed;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  toggle() {
    this.completed = !this.completed;
  }
}

module.exports = Todo;
