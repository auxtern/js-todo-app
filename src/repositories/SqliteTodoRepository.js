const TodoRepository = require('./TodoRepository');
const Todo = require('../domain/entities/Todo');

class SqliteTodoRepository extends TodoRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  static async init(db) {
    return new Promise((resolve, reject) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL
        )`,
        (err) => {
          if (err) return reject(err);
          resolve(new SqliteTodoRepository(db));
        }
      );
    });
  }

  async save(todo) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(
        `INSERT OR REPLACE INTO todos (id, title, completed, createdAt)
         VALUES (?, ?, ?, ?)`
      );

      const completedVal = todo.completed ? 1 : 0;
      const createdAtVal = todo.createdAt.toISOString();

      stmt.run(todo.id, todo.title, completedVal, createdAtVal, (err) => {
        if (err) return reject(err);
        resolve(todo);
      });
      stmt.finalize();
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM todos WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        resolve(new Todo({
          id: row.id,
          title: row.title,
          completed: row.completed === 1,
          createdAt: new Date(row.createdAt)
        }));
      });
    });
  }

  async findAll() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM todos`, [], (err, rows) => {
        if (err) return reject(err);
        const todos = rows.map(row => new Todo({
          id: row.id,
          title: row.title,
          completed: row.completed === 1,
          createdAt: new Date(row.createdAt)
        }));
        resolve(todos);
      });
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM todos WHERE id = ?`, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
}

module.exports = SqliteTodoRepository;
