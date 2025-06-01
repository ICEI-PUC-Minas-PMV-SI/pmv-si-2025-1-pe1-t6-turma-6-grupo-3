  class MockNotebookClient {
    constructor(initialData) {
      this.reset(initialData);
    }

    // Restaura ao estado inicial
    reset(initialData) {
      this.items = new Map();
      (initialData || []).forEach(item => this.items.set(String(item.id), { ...item }));
      this.nextId = this.items.size + 1;
    }

    // retorna todos os notebooks como array
    getAll() {
      return Array.from(this.items.values());
    }

    // encontra um notebook por id
    findItem(id) {
      return this.items.get(String(id)) || null;
    }

    // insere um novo notebook
    insertItem({ name, description, icon, image }) {
      const now = new Date().toISOString();
      const newItem = {
        id: String(this.nextId++),
        name,
        description,
        icon,
        image,
        createdAt: now,
        updatedAt: now
      };
      this.items.set(String(newItem.id), newItem);
      return [newItem, null];
    }

    // atualiza notebook existente
    updateItem(id, updates) {
      console.log("ID", id)
      const key = String(id);
      if (!this.items.has(key)) return [null, new Error("Key not found")];
      const item = this.items.get(key);
      Object.assign(item, updates);
      item.updatedAt = new Date().toISOString();
      this.items.set(key, item);
      return [item, null];
    }

    // deleta um notebook
    deleteItem(id) {
      return this.items.delete(String(id));
    }
  }

