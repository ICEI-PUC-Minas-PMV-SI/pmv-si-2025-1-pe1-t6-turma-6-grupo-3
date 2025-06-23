class MockTasksClient {
  constructor(initialData) {
    this.reset(initialData);
    this.callbacks = {};
  }

  reset(initialData) {
    this.items = new Map();
    (initialData || []).forEach(item => {
      this.items.set(String(item.id), { ...item });
    });
    this.nextId = this.items.size + 1;
  }

  getAll() {
    return Array.from(this.items.values());
  }

  findItem(id) {
    return this.items.get(String(id)) || null;
  }

  findItemsByParentTypeId(type, id) {
    return Array.from(this.items.values()).filter(task =>
      task.parent_type === type &&
      task.parent_location &&
      task.parent_location[`${type}_id`] == id
    );
  }


  taskFromContentMeta(meta) {
    return {
      id: meta.id || undefined,
      title: meta.name || "",
      description: meta.description || "",
      priority: meta.priority || "media",
      due_date: meta.due_date || "",
      completed_at: meta.completed_at || null,
      level: meta.level || 1,
      parent_id: meta.parent_id || null,
      parent_type: "content",
      parent_location: {
        notebook_id: meta.notebook_id,
        content_id: meta.content_id
      },
      created_at: meta.created_at || new Date().toISOString(),
      updated_at: meta.updated_at || new Date().toISOString()
    };
  }

  taskFromNotebook(notebook) {
    return {
      id: `notebook_${notebook.id}`,
      title: notebook.name || "",
      description: notebook.description || "",
      priority: notebook.priority || "media",
      due_date: notebook.due_date || "",
      completed_at: notebook.completed_at || null,
      level: 1,
      parent_id: null,
      parent_type: "notebook",
      parent_location: { notebook_id: notebook.id },
      created_at: notebook.created_at || new Date().toISOString(),
      updated_at: notebook.updated_at || new Date().toISOString()
    };
  }

  notebookFromTask(task) {
    // Considera o padrão da sua task no board para notebook
    return {
      id: task.parent_location?.notebook_id || task.id.replace(/^notebook_/, ""),
      name: task.title || "",
      description: task.description || "",
      due_date: typeof task.due_date === "string" ? task.due_date : fmt(task.due_date), // garante string YYYY-MM-DD
      completed_at: task.completed_at || null,
      created_at: task.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  contentMetaFromTask(task) {
    return {
      id: task.parent_location?.content_id,
      name: task.title || "",
      description: task.description || "",
      priority: task.priority || "media",
      due_date: typeof task.due_date === "string" ? task.due_date : fmt(task.due_date), // string YYYY-MM-DD
      completed_at: task.completed_at || null,
      notebook_id: task.parent_location?.notebook_id,
      content_id: task.parent_location?.content_id || task.id,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }

  upinsertItem(task) {
    const key = String(task.id || this.nextId++);
    if (!this.items.has(key)) return this.insertItem({ ...task, id: key });
    return this.updateItem(key, task);
  }

  insertItem({
    id,
    title,
    description,
    priority,
    due_date,
    completed_at = null,
    level = 1,
    parent_id = null,
    parent_type = null,
    parent_location = {},
  }) {
    const now = new Date().toISOString();
    const nextId = id || String(this.nextId++);
    const newItem = {
      id: nextId,
      title,
      description,
      priority: priority || "media",
      due_date: due_date || "",
      completed_at,
      level,
      parent_id,
      parent_type,
      parent_location,
      created_at: now,
      updated_at: now
    };
    this.items.set(nextId, newItem);
    this._emit("insert", newItem);
    return [newItem, null];
  }

  updateItem(id, updates) {
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

  deleteItem(id) {
    const oldItem = this.findItem(id);
    this.items.delete(String(id));
    this._emit("remove", oldItem);
  }

  _emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }
  on(event, cb) {
    if (this.callbacks[event]) {
      this.callbacks[event] = [...this.callbacks[event], cb];
    } else {
      this.callbacks[event] = [cb];
    }
  }
}
