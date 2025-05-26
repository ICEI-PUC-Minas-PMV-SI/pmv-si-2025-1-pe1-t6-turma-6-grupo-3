class MockContentNodesClient {
    /**
     * @param {Array<Object>} initialData - lista inicial de nós {id, type, value}
     */
    constructor(initialData = []) {
      this.reset(initialData);
    }

    /**
     * Restaura o client ao estado dos dados passados
     * @param {Array<Object>} data
     */
    reset(data = []) {
      this.items = new Map();
      data.forEach((node, i) => {
        this.items.set(String(node.id), { ...node, position: i });
      });
      this.nextId = this.items.size + 1;
    }

    /**
     * Retorna todos os nós como array
     * @returns {Array<Object>}
     */
    getAll() {
      return Array.from(this.items.values());
    }

    /**
     * Busca um nó pelo ID
     * @param {string|number} id
     * @returns {Object|null}
     */
    findItem(id) {
      return this.items.get(String(id)) || null;
    }

    /**
     * Insere um novo nó
     * @param {{type: string, value: string}} data
     * @returns {Object} o nó criado, com id
     */
    insertItem(data) {
      const node = {
        id: String(this.nextId++),
        type: data.type,
        value: data.value
      };
      this.items.set(node.id, node);
      return node;
    }

    /**
     * Atualiza um nó existente
     * @param {string|number} id
     * @param {{type?: string, value?: string}} updates
     * @returns {Object|null} o nó atualizado ou null se não existir
     */
    updateItem(id, updates) {
      const key = String(id);
      if (!this.items.has(key)) return null;
      const node = this.items.get(key);
      Object.assign(node, updates);
      this.items.set(key, node);
      return node;
    }

    /**
     * Remove um nó pelo ID
     * @param {string|number} id
     * @returns {boolean} true se removido, false caso não exista
     */
    deleteItem(id) {
      return this.items.delete(String(id));
    }
}