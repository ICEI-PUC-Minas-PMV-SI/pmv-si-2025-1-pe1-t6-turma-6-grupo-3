  
  const LOGIN_URL = "login.html";
  const HOME_URL = "caderno-lista-v2.html";

  (function(global) {
    'use strict';
    const sfb_app = {};

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
    sfb_app.share = new ShareEngine(window.location.origin + "/src/pages/caderno-shared.html");
    
    sfb_app.url_service = new UrlService();
    
    sfb_app._search = new SearchClient({ bloomSizeBits: 50000 });
    sfb_app.search = (term) => sfb_app._search.search(term);
   
    sfb_app.notebookClient = new MockNotebookClient(initial.notebooks);
    sfb_app.contentMetaClient = new MockContentMetadataClient();
    sfb_app.contentNodesClient = new MockContentNodesClient();
    sfb_app.userClient = new MockUserClient(initial.users);
    sfb_app.eventClient = new MockEventsClient();

    sfb_app.storageUser = new StorageManager(sfb_app.userClient, USER_LIST_KEY);

    sfb_app.session = new SessionManager(sfb_app.userClient, sfb_app.storageUser);

    function loadNotebooksForCurrentUser(user) {
        if (!user) {
          return
        }
        if (sfb_app.storageNB) {
          sfb_app.storageNB.save();
        }

        if (sfb_app.storageMeta) {
          sfb_app.storageMeta.save();
        }

        if (sfb_app.storageNodes) {
          sfb_app.storageNodes.save();
        }

         if (sfb_app.storageEvents) {
          sfb_app.storageEvents.save();
        }

        const eventKey = 'events_of_' + user.id;
        sfb_app.storageEvents = new StorageManager(sfb_app.eventClient, eventKey);
        sfb_app.storageEvents.load();

        const notebookKey = 'notebooks_of_' + user.id;
        sfb_app.storageNB = new StorageManager(sfb_app.notebookClient, notebookKey);
        sfb_app.storageNB.load();


        const metaKey = 'contents_meta_of_user_' + user.id ;
        sfb_app.storageMeta = new StorageManager(sfb_app.contentMetaClient, metaKey);
        sfb_app.storageMeta.load();

        const nodeKey = 'contents_nodes_of_user_' + user.id
        sfb_app.storageNodes = new StorageManager(sfb_app.contentNodesClient, nodeKey);
        sfb_app.storageNodes.load()

        ///////////////////// SEARCH INDEX
        //////////////////// NOTEBOOK
        sfb_app.notebookClient.getAll().forEach(notebook => {
            const newItem = {
              type: "notebook",
              label: notebook.name,
              localization: { notebook_id: notebook.id },
              terms: extractTerms(`${notebook.icon} ${notebook.name} ${notebook.description}`),
            };
            sfb_app._search.addItem(newItem);

            if (notebook.due_date) {
              console.log('=========== sfb_app.notebookClient.getAll()');
              const event = sfb_app.eventClient.eventFromNotebook(notebook);
              sfb_app.eventClient.upinsertItem(event);
              sfb_app.storageEvents.save();
            }
        })


        sfb_app.notebookClient.on("remove", oldData => {
          console.log("notebook client removed", oldData);
          const toRemoveItem = {
              type: "notebook",
              label: oldData.name,
              localization: { notebook_id: oldData.id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.description}`),
          };
          sfb_app._search.removeItem(toRemoveItem);

          const allMetaToBeRemoved = sfb_app.contentMetaClient.getAllFromNotebook(oldData.id);
          allMetaToBeRemoved.forEach(meta => {
            console.log("meta to be removed", meta);
            sfb_app.contentMetaClient.deleteItem(meta.id);
          });
          sfb_app.storageMeta.save();

          const event = sfb_app.eventClient.findItem(`notebook_${oldData.id}`);
          if (event) {
            sfb_app.eventClient.deleteItem(`notebook_${oldData.id}`);
            sfb_app.storageEvents.save();
          }

        });

        sfb_app.notebookClient.on("insert", newData => {
            const newItem = {
              type: "notebook",
              label: newData.name,
              localization: { notebook_id: newData.id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.description}`),
            };
            sfb_app._search.addItem(newItem);

            if (newData.due_date) {
              const event = sfb_app.eventClient.eventFromNotebook(newData);
              sfb_app.eventClient.upinsertItem(event);
              sfb_app.storageEvents.save();
            }
        });

        sfb_app.notebookClient.on("update", ([oldData, newData]) => {
            const toRemoveItem = {
              type: "notebook",
              label: oldData.name,
              localization: { notebook_id: oldData.id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.description}`),
            };
            sfb_app._search.removeItem(toRemoveItem);

            const newItem = {
              type: "notebook",
              label: newData.name,
              localization: { notebook_id: newData.id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.description}`),
            };
            sfb_app._search.addItem(newItem);

            if (newData.due_date) {
              const event = sfb_app.eventClient.eventFromNotebook(newData);
              sfb_app.eventClient.upinsertItem(event);
              sfb_app.storageEvents.save();
            }

            if (!newData.due_date && oldData.due_date) {
              const event = sfb_app.eventClient.findItem(`notebook_${oldData.id}`);
              if (event) {
                sfb_app.eventClient.deleteItem(`notebook_${oldData.id}`);
                sfb_app.storageEvents.save();
              }
            }
        });

        //////////////////////////// META
        sfb_app.contentMetaClient.getAll().forEach(meta => {
            const newItem = {
              type: "content-meta",
              label: meta.name,
              localization: { notebook_id: meta.notebook_id, content_id: meta.content_id },
              terms: extractTerms(`${meta.icon} ${meta.name} ${meta.tags.map(({name}) => name).join(" ")}`),
            };
            sfb_app._search.addItem(newItem);

            if (meta.due_date) {
              const event = sfb_app.eventClient.eventFromContentMeta(meta);
              sfb_app.eventClient.upinsertItem(event);
              sfb_app.storageEvents.save();
            }

        });

        sfb_app.contentMetaClient.on("remove", oldData => {
            const toRemoveItem = {
              type: "content-meta",
              label: oldData.name,
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.tags.map(({name}) => name).join(" ")}`),
            };
            sfb_app._search.removeItem(toRemoveItem);

            const allNodesToBeRemoved = sfb_app.contentNodesClient.getAllFromNotebookContent(oldData.notebook_id, oldData.content_id);
            allNodesToBeRemoved.forEach(node => {
              sfb_app.contentNodesClient.deleteItem(node.id);
            });
            sfb_app.storageNodes.save();

            const event = sfb_app.eventClient.findItem(oldData.id);
            if (event) {
              sfb_app.eventClient.deleteItem(oldData.id);
              sfb_app.storageEvents.save();
            }
        });

        sfb_app.contentMetaClient.on("insert", newData => {
           const newItem = {
              type: "content-meta",
              label: newData.name,
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.tags.map(({name}) => name).join(" ")}`),
            };
            sfb_app._search.addItem(newItem);

            if (newData.due_date) {
              const event = sfb_app.eventClient.eventFromContentMeta(newData);
              sfb_app.eventClient.upinsertItem(event);
              sfb_app.storageEvents.save();
            }
        });

        sfb_app.contentMetaClient.on("update", ([oldData, newData]) => {
            const toRemoveItem = {
              type: "content-meta",
              label: oldData.name,
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id },
              terms: extractTerms(`${oldData.icon} ${oldData.name} ${oldData.tags.map(({name}) => name).join(" ")}`),
            };
            sfb_app._search.removeItem(toRemoveItem);

            const newItem = {
              type: "content-meta",
              label: newData.name,
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id },
              terms: extractTerms(`${newData.icon} ${newData.name} ${newData.tags.map(({name}) => name).join(" ")}`),
            };
            sfb_app._search.addItem(newItem);

            if (newData.due_date) {
              const event = sfb_app.eventClient.eventFromContentMeta(newData);
              sfb_app.eventClient.upinsertItem(event);
              sfb_app.storageEvents.save();
            }

            if (!newData.due_date && oldData.due_date) {
              const event = sfb_app.eventClient.findItem(oldData.id);
              if (event) {
                sfb_app.eventClient.deleteItem(oldData.id);
                sfb_app.storageEvents.save();
              }
            }
        });
        
        ////////////////////////// NODES
        sfb_app.contentNodesClient.getAll().forEach(node => {
            const newItem = {
              type: "content-node",
              label: `${node.type} | ${node.value}`,
              localization: { notebook_id: node.notebook_id, content_id: node.content_id, node_id: node.id  },
              terms: extractTerms(`${node.value}}`),
            };
            sfb_app._search.addItem(newItem);
        });
        sfb_app.contentNodesClient.on("remove", oldData => {
            const toRemoveItem = {
              type: "content-node",
              label: `${oldData.type} | ${oldData.value}`,
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id, node_id: oldData.id },
              terms: extractTerms(`${oldData.value}`),
            };
            sfb_app._search.removeItem(toRemoveItem);
        });

        sfb_app.contentNodesClient.on("insert", newData => {
           const newItem = {
              type: "content-node",
              label: `${newData.type} | ${newData.value}`,
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id, node_id: newData.id },
              terms: extractTerms(`${newData.value}`),
            };
            sfb_app._search.addItem(newItem);
        });

        sfb_app.contentNodesClient.on("update", ([oldData, newData]) => {
            const toRemoveItem = {
              type: "content-node",
              label: `${oldData.type} | ${oldData.value}`,
              localization: { notebook_id: oldData.notebook_id, content_id: oldData.content_id, node_id: oldData.id },
              terms: extractTerms(`${oldData.value}`),
            };
            sfb_app._search.removeItem(toRemoveItem);

            const newItem = {
              type: "content-node",
              label: `${newData.type} | ${newData.value}`,
              localization: { notebook_id: newData.notebook_id, content_id: newData.content_id, node_id: newData.id },
              terms: extractTerms(`${newData.value}`),
            };
            sfb_app._search.addItem(newItem);
        });
    }

    sfb_app.session.onChangeUser(loadNotebooksForCurrentUser);
    loadNotebooksForCurrentUser(sfb_app.session.getCurrentUser());
    global.sfb_app = sfb_app;
  })(window);
  