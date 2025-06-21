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

    // retorna todos os eventos como array
    getAll() {
      return Array.from(this.items.values());
    }

    // encontra um evento por id
    findItem(id) {
      return this.items.get(String(id)) || null;
    }

    // encontra um evento por parent type(notebook, task, content)
    findItemsByParentTypeId(type, id) {
      const items =  Array.from(this.items.values()).filter(event => {
        if (
          event.parent_type = type 
            && event.parent_location[`${type}_id`] == id
        ) {
          return true;
        }
        return false;
      })
      return items
    }

  
    eventFromContentMeta(meta) {
      return { 
        name: meta.name, // event title
        // description: "", // open description
        all_day: true, // bool
        start_date: meta.due_date, // date
        end_date: meta.due_date, // date
        priority: "medium", // high, medium, low
        // owner, //{ name, email }
        // guests, // [{ name, email }]
        parent_location: {notebook_id: meta.notebook_id, content_id: meta.content_id}, // notebook_id, content_id, task_id
        parent_type: "content",
        id: meta.id,
      }
    }

    eventFromNotebook(notebook) {
      return { 
              name: notebook.name, // event title
              // description: "", // open description
              all_day: true, // bool
              start_date: notebook.due_date, // date
              end_date: notebook.due_date, // date
              priority: "medium", // high, medium, low
              // owner, //{ name, email }
              // guests, // [{ name, email }]
              parent_location: { notebook_id: notebook.id}, // notebook_id, content_id, task_id
              parent_type: "notebook",
              id: `notebook_${notebook.id}`,
            }
    }

    upinsertItem(event) {
      const key = String(event.id);
      if (!this.items.has(key)) return this.insertItem(event);
      return this.updateItem(event.id, event);
    }

    // insere um novo notebook
    insertItem({ 
        id,
        name, // event title
        description, // open description
        all_day, // bool
        start_date, // date
        end_date, // date
        priority, // high, medium, low
        owner, //{ name, email }
        guests, // [{ name, email }]
        parent_location, // notebook_id, content_id, task_id
        parent_type, // notebook, content, task, null
    }) {
      const now = new Date().toISOString();
      const nextId = id || this.nextId++;
      const newItem = {
        id: String(nextId),
        name,
        description,
        all_day,
        start_date,
        end_date,
        priority,
        owner,
        guests,
        parent_location,
        parent_type,
        created_at: now,
        updated_at: now
      };
      this.items.set(String(newItem.id), newItem);
      this._emit("insert", newItem);

      return [newItem, null];
    }

    // atualiza event existente
    updateItem(id, updates) {
      console.log("ID", id)
      const key = String(id);
      if (!this.items.has(key)) return [null, new Error("Key not found")];
      const oldItem = this.items.get(key);
      const newItem = { 
        ...oldItem, 
        ...updates, 
        id: oldItem.id,
        updated_at: new Date().toISOString(),
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

