/**
   * Gerencia persistência do MockClient em localStorage
   */
class StorageManager {
    /**
     * @param {MockClient} clientInstance
     * @param {string} storageKey
     */
    constructor(clientInstance, storageKey) {
      this.client = clientInstance;
      this.key = storageKey;
    }

    // Salva estado atual no localStorage
    save() {
      const data = this.client.getAll();
      localStorage.setItem(this.key, JSON.stringify(data));
    }

    // Carrega e reseta o client com dados do localStorage
    load() {
      try {
        const raw = localStorage.getItem(this.key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        this.client.reset(parsed);
        // Ajusta nextId conforme ids carregados
        const maxId = parsed.reduce((max, item) => Math.max(max, Number(item.id)), 0);
        this.client.nextId = maxId + 1;
        return true;
      } catch (e) {
        console.error('Falha ao carregar dados do Storage:', e);
        return false;
      }
    }

    // Limpa os dados do localStorage e reseta o client ao INITIAL_ITEMS
    clear() {
      localStorage.removeItem(this.key);
      this.client.reset(initial);
    }
  }