  
  const LOGIN_URL = "login.html";
  const HOME_URL = "caderno-lista-v2.html";

  (function(global) {
    'use strict';

    if (window.TagSelectorFactory) {
      TagSelectorFactory(global);
    }

    const initial = {
      users: [
          { 
            "id": '0', 
            "login": "admin", 
            "password": "123", 
            "name": "Admin", 
            "role": "admin", 
            "fullName": "Administrador do Sistema", 
            "email": "admin@abc.com"
          },
          { 
            "id": '1', 
            "login": "user", 
            "password": "123", 
            "name": "User", 
            "role": "user",
            "fullName": "Usuario Comum", 
            "email": "user@abc.com"
          },
      ],
      notebooks: [
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
      ],
      contents: [],
  };

    global._search = new SearchClient({ bloomSizeBits: 50000 });
    global.search = (term) => global._search.search(term);
    global.notebookClient = new MockNotebookClient(initial.notebooks);

    global.contentMetaClient = new MockContentMetadataClient();
    global.contentNodesClient = new MockContentNodesClient();
    global.userClient = new MockUserClient(initial.users);
    global.storageUser = new StorageManager(global.userClient, USER_LIST_KEY);
    global.session = new SessionManager(userClient, storageUser);

    function loadNotebooksForCurrentUser(user) {
        if (!user) {
          return
        }
        if (global.storageNB) {
          global.storageNB.save();
        }

        if (global.storageMeta) {
          global.storageMeta.save();
        }

        if (global.storageNode) {
          global.storageNode.save();
        }
        const notebookKey = 'notebooks_of_' + user.id;
        global.storageNB = new StorageManager(global.notebookClient, notebookKey);
        global.storageNB.load();

        const metaKey = 'contents_meta_of_user_' + user.id ;
        global.storageMeta = new StorageManager(global.contentMetaClient, metaKey);
        global.storageMeta.load();

        const nodeKey = 'contents_nodes_of_user_' + user.id
        global.storageNodes = new StorageManager(global.contentNodesClient, nodeKey);
        global.storageNodes.load()

        ///////////////////// SEARCH INDEX
        //////////////////// NOTEBOOK
        global.notebookClient.getAll().forEach(notebook => {
            const newItem = {
              type: "notebook",
              localization: { notebook_id: notebook.id },
              terms: extractTerms(`${notebook.icon} ${notebook.name} ${notebook.description}`),
            };
            global._search.addItem(newItem);
        })


        global.notebookClient.on("remove", oldData => {
            const toRemoveItem = {
              type: "notebook",
              localization: { notebook_id: oldData.id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.description}`),
            };
            global._search.removeItem(toRemoveItem);
        });

        global.contentMetaClient.on("insert", newData => {
            const newItem = {
              type: "notebook",
              localization: { notebook_id: newData.id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.description}`),
            };
            global._search.addItem(newItem);
        });

        global.contentMetaClient.on("update", ([oldData, newData]) => {
            const toRemoveItem = {
              type: "notebook",
              localization: { notebook_id: oldData.id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.description}`),
            };
            global._search.removeItem(toRemoveItem);

            const newItem = {
              type: "notebook",
              localization: { notebook_id: newData.id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.description}`),
            };
            global._search.addItem(newItem);
        });

        //////////////////////////// META
        global.contentMetaClient.getAll().forEach(meta => {
            const newItem = {
              type: "content-meta",
              localization: { notebook_id: meta.notebook_id, content_id: meta.content_id },
              terms: extractTerms(`${meta.icon} ${meta.name} ${meta.tags.map(({name}) => name).join(" ")}`),
            };
            global._search.addItem(newItem);
        });

        global.contentMetaClient.on("remove", oldData => {
            const toRemoveItem = {
              type: "content-meta",
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.tags.map(({name}) => name).join(" ")}`),
            };
            global._search.removeItem(toRemoveItem);
        });

        global.contentMetaClient.on("insert", newData => {
           const newItem = {
              type: "content-meta",
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.tags.map(({name}) => name).join(" ")}`),
            };
            global._search.addItem(newItem);
        });

        global.contentMetaClient.on("update", ([oldData, newData]) => {
            const toRemoveItem = {
              type: "content-meta",
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.tags.map(({name}) => name).join(" ")}`),
            };
            global._search.removeItem(toRemoveItem);

            const newItem = {
              type: "content-meta",
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.tags.map(({name}) => name).join(" ")}`),
            };
            global._search.addItem(newItem);
        });
        
        ////////////////////////// NODES
        global.contentNodesClient.getAll().forEach(node => {
            const newItem = {
              type: "content-node",
              localization: { notebook_id: node.notebook_id, content_id: node.content_id, node_id: node.id  },
              terms: extractTerms(`${node.value}}`),
            };
            global._search.addItem(newItem);
        });
        global.contentNodesClient.on("remove", oldData => {
            const toRemoveItem = {
              type: "content-node",
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id, node_id: oldData.id },
              terms: extractTerms(`${oldData.value}`),
            };
            global._search.removeItem(toRemoveItem);
        });

        global.contentNodesClient.on("insert", newData => {
           const newItem = {
              type: "content-node",
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id, node_id: newData.id },
              terms: extractTerms(`${newData.value}`),
            };
            global._search.addItem(newItem);
        });

        global.contentNodesClient.on("update", ([oldData, newData]) => {
            const toRemoveItem = {
              type: "content-node",
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id, node_id: oldData.id },
              terms: extractTerms(`${oldData.value}`),
            };
            global._search.removeItem(toRemoveItem);

            const newItem = {
              type: "content-node",
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id, node_id: newData.id },
              terms: extractTerms(`${newData.value}`),
            };
            global._search.addItem(newItem);
        });
    }

    global.session.onChangeUser(loadNotebooksForCurrentUser);
    loadNotebooksForCurrentUser(session.getCurrentUser());
  })(window);
  