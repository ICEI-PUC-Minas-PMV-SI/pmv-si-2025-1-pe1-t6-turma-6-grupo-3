const USER_LIST_KEY = 'notebook_user_list';
const CURRENT_USER_KEY = 'notebook_current_user';
const _callbacks = [];

class MockUserClient {
  constructor(initialUsers = []) {
    this.reset(initialUsers);
  }

  reset(users) {
    this._users = new Map();
    this._usersByEmail = new Map()
    this._nextId = 1;

    users.forEach(u => {
      const id = String(u.id || this._nextId++);
      this._users.set(id, { ...u, id });
      this._usersByEmail.set(u.email, id);
      this._nextId = Math.max(this._nextId, Number(id) + 1);

    });
  }

  getAll() {
    return Array.from(this._users.values());
  }

  findItem(id) {
    return this._users.get(String(id)) || null;
  }

  findItemByEmail(email) {
    const id = this._usersByEmail.get(String(email)) || null;
    if (!id) return [null, new Error("User com email não encontrado")];

    return [this.findItem(id), null];
  }

  insertItem(data) {
    const id = String(this._nextId++);
    const user = { 
      id, name: 
      data.name, 
      fullName: data.fullName, 
      email: data.email, 
      password: data.password, 
      role: data.role
     };
    this._users.set(id, user);
    return { ...user };
  }

  updateItem(id, updates) {
    const key = String(id);
    const u = this._users.get(key);
    if (!u) return [null, new Error("User não encontrado")];
    const updated = { ...u, ...updates, id: key };
    this._users.set(key, updated);
    return [{ ...updated }, null];
  }

  deleteItem(id) {
    const key = String(id);
    const u = this._users.get(key);
    if (!u) return new Error("User não encontrado");
    this._users.delete(key);
  }
}