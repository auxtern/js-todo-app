const TodoRepository = require('../../src/repositories/TodoRepository');

describe('TodoRepository (abstract base)', () => {
  const repository = new TodoRepository();

  it('should throw on save', async () => {
    await expect(repository.save({})).rejects.toThrow('Method not implemented');
  });

  it('should throw on findById', async () => {
    await expect(repository.findById('1')).rejects.toThrow('Method not implemented');
  });

  it('should throw on findAll', async () => {
    await expect(repository.findAll()).rejects.toThrow('Method not implemented');
  });

  it('should throw on delete', async () => {
    await expect(repository.delete('1')).rejects.toThrow('Method not implemented');
  });
});
