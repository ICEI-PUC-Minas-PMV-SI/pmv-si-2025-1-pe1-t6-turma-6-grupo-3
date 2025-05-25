class MockContentMetadataClient {
    constructor(initialData = []) {
      this.reset(initialData);
    }
    reset(initialData = []) {
      this.items = new Map();
      initialData.forEach(item => this.items.set(item.id, { ...item }));
      this.nextId = this.items.size + 1;
    }
    getAll() { return Array.from(this.items.values()); }
    findItem(id) { return this.items.get(String(id)) || null; }
    insertItem(data) {
      // TODO: add validation
      const newItem = { id: String(this.nextId++), ...data };
      this.items.set(newItem.id, newItem);
      return [newItem, null];
    }
    updateItem(id, updates) {
      const key = String(id);
      if (!this.items.has(key)) return null;
      const it = this.items.get(key);
      Object.assign(it, updates);
      this.items.set(key, it);
      return [it, null];
    }
    deleteItem(id) {
      this.items.delete(String(id));
      return null;
    }
  }