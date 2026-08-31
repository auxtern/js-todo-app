const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawn } = require('node:child_process');

// index.mjs is a top-level-await ES module, so it's exercised as a real
// child process rather than required/imported into the Jest (CJS) runtime.
describe('index.mjs (integration)', () => {
  let child;
  let baseUrl;
  let dbPath;

  beforeAll((done) => {
    dbPath = path.join(os.tmpdir(), `todos-test-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`);

    child = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'index.mjs')], {
      env: { ...process.env, APP_PORT: '0', DB_PATH: dbPath }
    });

    child.on('error', done);

    let output = '';
    const onData = (chunk) => {
      output += chunk.toString();
      const match = output.match(/listening on port (\d+)/);
      if (match) {
        baseUrl = `http://127.0.0.1:${match[1]}`;
        child.stdout.off('data', onData);
        done();
      }
    };

    child.stdout.on('data', onData);
  }, 10000);

  afterAll(async () => {
    await new Promise((resolve) => {
      child.once('exit', resolve);
      child.kill();
    });
    // best-effort cleanup: the sqlite file handle may still be releasing on Windows
    try {
      fs.rmSync(dbPath, { force: true });
    } catch {
      // ignore cleanup failures
    }
  });

  it('should create, list, toggle and delete a todo end-to-end', async () => {
    const createRes = await fetch(`${baseUrl}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Integration test todo' })
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.title).toBe('Integration test todo');
    expect(created.completed).toBe(false);

    const listRes = await fetch(`${baseUrl}/todos`);
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);

    const toggleRes = await fetch(`${baseUrl}/todos/${created.id}/toggle`, { method: 'PATCH' });
    expect(toggleRes.status).toBe(200);
    const toggled = await toggleRes.json();
    expect(toggled.completed).toBe(true);

    const deleteRes = await fetch(`${baseUrl}/todos/${created.id}`, { method: 'DELETE' });
    expect(deleteRes.status).toBe(204);

    const emptyListRes = await fetch(`${baseUrl}/todos`);
    const emptyList = await emptyListRes.json();
    expect(emptyList).toHaveLength(0);
  });

  it('should not disclose the framework via the X-Powered-By header', async () => {
    const res = await fetch(`${baseUrl}/todos`);
    expect(res.headers.get('x-powered-by')).toBeNull();
  });

  it('should return 400 when creating a todo without a title', async () => {
    const res = await fetch(`${baseUrl}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    expect(res.status).toBe(400);
  });

  it('should return 404 when toggling a non-existent todo', async () => {
    const res = await fetch(`${baseUrl}/todos/non-existent/toggle`, { method: 'PATCH' });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/);
  });

  it('should return 404 when deleting a non-existent todo', async () => {
    const res = await fetch(`${baseUrl}/todos/non-existent`, { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
