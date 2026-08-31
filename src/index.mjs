import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import SqliteTodoRepository from './repositories/SqliteTodoRepository.js';
import CreateTodo from './usecases/CreateTodo.js';
import GetTodos from './usecases/GetTodos.js';
import ToggleTodo from './usecases/ToggleTodo.js';
import DeleteTodo from './usecases/DeleteTodo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// load APP_PORT/etc. from .env without overriding vars already set in the environment
try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
  // no .env file present, fall back to process env / defaults
}

const PORT = process.env.APP_PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'todos.sqlite');

const db = new sqlite3.Database(DB_PATH);
const todoRepository = await SqliteTodoRepository.init(db);

const createTodo = new CreateTodo(todoRepository);
const getTodos = new GetTodos(todoRepository);
const toggleTodo = new ToggleTodo(todoRepository);
const deleteTodo = new DeleteTodo(todoRepository);

const app = express();
app.disable('x-powered-by'); // avoid disclosing framework/version via X-Powered-By header
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

app.listen(PORT, function () {
  // read back the bound port so APP_PORT=0 (ephemeral port) is reported correctly
  console.log(`Todo web service listening on port ${this.address().port}`);
});
