const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');

const SqliteTodoRepository = require('./repositories/SqliteTodoRepository');
const CreateTodo = require('./usecases/CreateTodo');
const GetTodos = require('./usecases/GetTodos');
const ToggleTodo = require('./usecases/ToggleTodo');
const DeleteTodo = require('./usecases/DeleteTodo');

const PORT = process.env.APP_PORT || 3000;

async function main() {
  const db = new sqlite3.Database(path.join(__dirname, '..', 'todos.sqlite'));
  const todoRepository = await SqliteTodoRepository.init(db);

  const createTodo = new CreateTodo(todoRepository);
  const getTodos = new GetTodos(todoRepository);
  const toggleTodo = new ToggleTodo(todoRepository);
  const deleteTodo = new DeleteTodo(todoRepository);

  const app = express();
  app.use(express.json());

  app.get('/todos', async (req, res, next) => {
    try {
      const todos = await getTodos.execute();
      res.json(todos);
    } catch (err) {
      next(err);
    }
  });

  app.post('/todos', async (req, res, next) => {
    try {
      const todo = await createTodo.execute({ title: req.body.title });
      res.status(201).json(todo);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/todos/:id/toggle', async (req, res, next) => {
    try {
      const todo = await toggleTodo.execute({ id: req.params.id });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  });

  app.delete('/todos/:id', async (req, res, next) => {
    try {
      await deleteTodo.execute({ id: req.params.id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  // fallback error handler translates use case errors to HTTP responses
  app.use((err, req, res, next) => {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: err.message });
  });

  app.listen(PORT, () => {
    console.log(`Todo web service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
