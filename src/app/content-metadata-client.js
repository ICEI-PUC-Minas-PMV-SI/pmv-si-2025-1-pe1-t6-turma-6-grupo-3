class MockContentMetadataClient {
    constructor(initialData = []) {
      this.callbacks = {};
      this.reset(initialData);
    }

    reset(initialData = []) {
      this.items = new Map();
      initialData.forEach(item => this.items.set(item.id, { ...item }));
      this.nextId = this.items.size + 1;
    }
    _build_key(notebook_id, content_id) {
      return `notebook_${notebook_id}_content_${content_id}`;
    }

    getAll() { return Array.from(this.items.values()); }

    getAllFromNotebook(notebook_id) { 
      return Array.from(this.items.values())
        .filter(item => item.notebook_id === notebook_id); 
    }

    findItem(notebook_id, content_id) { 
      return this.items.get(this._build_key(notebook_id, content_id)) || null;
    }

    insertItem(notebook_id, data) {
      // todo: replace with uuid
      const notebookContents = this.getAllFromNotebook(notebook_id);
      console.log("insertItem::this.nextId", `${this.nextId}`)
      
      const content_id = String(notebookContents.length+1)
      console.log("insertItem::content_id", content_id)

      const newItem = { 
        ...data, 
        id: this._build_key(notebook_id, content_id), 
        content_id,
        notebook_id,
      };
      this.items.set(newItem.id, newItem);
      this._emit("insert", newItem);
    
      return [newItem, null];
    }

    updateItem(id, updates) {
      const key = id;
      if (!this.items.has(key)) return null;
      const oldContent = this.items.get(key);
      const newContent = {
        ...oldContent,
        ...updates,
        id: key,
        content_id: oldContent.content_id,
        notebook_id: oldContent.notebook_id,
      };
      this.items.set(key, newContent);
      this._emit("update", [oldContent, newContent]);

      return [newContent, null];
    }

    deleteItem(id) {
      const oldItem = this.items.get(id);
      this.items.delete(String(id));
      this._emit("remove", oldItem);

      return null;
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