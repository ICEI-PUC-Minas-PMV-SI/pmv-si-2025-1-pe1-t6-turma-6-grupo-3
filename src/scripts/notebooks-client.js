// Itens iniciais do currículo (em Português)
const INITIAL_ITEMS = [
    {
      id: '1',
      name: 'Introdução ao Desenvolvimento de Software',
      description: 'Visão geral dos conceitos fundamentais do desenvolvimento de software.',
      icon: 'code-square',
      image: '',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '2',
      name: 'Lógica de Programação',
      description: 'Fundamentos de algoritmos, estruturas de controle e resolução de problemas.',
      icon: 'calculator',
      image: '',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '3',
      name: 'Estruturas de Dados',
      description: 'Conceitos de arrays, listas, pilhas, filas e árvores.',
      icon: 'diagram-2',
      image: '../../docs/img/wireframe-example.png',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '4',
      name: 'Algoritmos e Complexidade',
      description: 'Análise de algoritmos e notações de complexidade temporal e espacial.',
      icon: 'bar-chart-line',
      image: '',
      createdAt: '2025-04-01T09:00:00.000Z',
      updatedAt: '2025-04-01T09:00:00.000Z'
    },
    {
      id: '5',
      name: 'Versionamento com Git',
      description: 'Controle de versão de código usando Git e GitHub.',
      icon: 'github',
      image: '',
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

