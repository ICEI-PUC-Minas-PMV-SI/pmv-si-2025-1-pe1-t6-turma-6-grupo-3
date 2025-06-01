class MockContentNodesClient {
    /**
     * @param {Array<Object>} initialData - lista inicial de nós {id, type, value}
     */
    constructor(search, initialData = []) {
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

    resetOfNotebookContent(notebook_id, content_id, data = []) {
      const same = Array.from(this.items.values()).filter(
        node => `${node.notebook_id}-${node.content_id}` != `${notebook_id}-${content_id}`
      )
      this.reset([...data, ...same]);
    }

    /**
     * Retorna todos os nós como array
     * @returns {Array<Object>}
     */
    getAll() {
      return Array.from(this.items.values());
    }

    getAllFromNotebookContent(notebook_id, content_id) { 
      return Array.from(this.items.values())
        .filter(item => item.notebook_id === notebook_id && item.content_id === content_id); 
    }

    /**
     * Busca um nó pelo ID
     * @param {string|number} id
     * @returns {Object|null}
     */
    findItem(id) {
      return this.items.get(String(id)) || null;
    }

    _build_key(notebook_id, content_id, node_id) {
       return `notebook_${notebook_id}_content_${content_id}_node_${node_id}`
    }

    /**
     * Insere um novo nó
     * @param {{type: string, value: string}} data
     * @returns {Object} o nó criado, com id
     */
    insertItem(notebook_id, content_id, data) {
      const node = {
        id: `notebook_${notebook_id}_content_${content_id}_node_${String(this.nextId++)}`,
        notebook_id, 
        content_id,
        type: data.type,
        value: data.value,
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
    updateItem(notebook_id, content_id, node_id, updates) {
      const key = `notebook_${notebook_id}_content_${content_id}_node_${String(node_id)}`;
      
      if (!this.items.has(key)) return null;
      
      const oldNode = this.items.get(key);
      const newNode = {
        ...oldNode,
        ...updates,
        id: key,
        notebook_id, 
        content_id,
      }
      this.items.set(key, newNode);
      
      return newNode;
    }

    /**
     * Remove um nó pelo ID
     * @param {string|number} id
     * @returns {boolean} true se removido, false caso não exista
     */
    deleteItem(notebook_id, content_id, node_id) {
      const key = `notebook_${notebook_id}_content_${content_id}_node_${String(node_id)}`;
      return this.items.delete(key);
    }
}