// Itens iniciais do currículo (em Português)
const INITIAL_ITEMS = [
    {
      id: '1',
      name: 'Introdução ao Desenvolvimento de Software',
      description: 'Visão geral dos conceitos fundamentais do desenvolvimento de software.',
      icon: 'bi-code-square',
      image: 'https://via.placeholder.com/150',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '2',
      name: 'Lógica de Programação',
      description: 'Fundamentos de algoritmos, estruturas de controle e resolução de problemas.',
      icon: 'bi-calculator',
      image: 'https://via.placeholder.com/150',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '3',
      name: 'Estruturas de Dados',
      description: 'Conceitos de arrays, listas, pilhas, filas e árvores.',
      icon: 'bi-diagram-2',
      image: 'https://via.placeholder.com/150',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '4',
      name: 'Algoritmos e Complexidade',
      description: 'Análise de algoritmos e notações de complexidade temporal e espacial.',
      icon: 'bi-bar-chart-line',
      image: 'https://via.placeholder.com/150',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '5',
      name: 'Versionamento com Git',
      description: 'Controle de versão de código usando Git e GitHub.',
      icon: 'bi-github',
      image: 'https://via.placeholder.com/150',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    }
  ];


  class MockNotebookClient {
    constructor(initialData) {
      this.reset(initialData);
    }

    // Restaura ao estado inicial
    reset(initialData) {
      this.items = new Map();
      (initialData || []).forEach(item => this.items.set(item.id, { ...item }));
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
      this.items.set(newItem.id, newItem);
      return newItem;
    }

    // atualiza notebook existente
    updateItem(id, updates) {
      const key = String(id);
      if (!this.items.has(key)) return null;
      const item = this.items.get(key);
      Object.assign(item, updates);
      item.updatedAt = new Date().toISOString();
      this.items.set(key, item);
      return item;
    }

    // deleta um notebook
    deleteItem(id) {
      return this.items.delete(String(id));
    }
  }

