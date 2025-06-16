  class MockEventsClient {
    constructor(initialData) {
      this.reset(initialData);
      this.callbacks = {};
    }

    // Restaura ao estado inicial
    reset(initialData) {
      
      this.items = new Map();
      (initialData || []).forEach(item => {
        this.items.set(String(item.id), { ...item });
      });
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
    insertItem({ 
        name, 
        description, 
        icon, 
        image,
    }) {
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
      this._emit("insert", newItem);

      return [newItem, null];
    }

    // atualiza notebook existente
    updateItem(id, updates) {
      console.log("ID", id)
      const key = String(id);
      if (!this.items.has(key)) return [null, new Error("Key not found")];
      const oldItem = this.items.get(key);
      const newItem = { 
        ...oldItem, 
        ...updates, 
        id: oldItem.id,
        updatedAt: new Date().toISOString(),
      };
      this.items.set(key, newItem);
      this._emit("update", [oldItem, newItem]);
      return [newItem, null];
    }

    // deleta um notebook
    deleteItem(id) {
      const oldItem = this.findItem(id);
      this.items.delete(String(id));
      this._emit("remove", oldItem);
    }

    _emit(event, data) {
      if(this.callbacks[event]) {
        this.callbacks[event].forEach( cb => cb(data))
      }
    }
    on(event, cb) {
      if(this.callbacks[event]) {
        this.callbacks[event] = [...this.callbacks[event], cb];
      } else {
         this.callbacks[event] = [cb];
      }
    }
  }

