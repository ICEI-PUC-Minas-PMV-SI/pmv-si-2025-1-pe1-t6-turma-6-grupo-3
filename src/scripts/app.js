  
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

        const notebookID = UrlService.getParam("notebookId");
        if (notebookID) {
          const metaKey = 'contents_meta_' + user.id + '_' + notebookID;
          global.storageMeta = new StorageManager(global.contentMetaClient, metaKey);
        } else {
          global.storageMeta = new StorageManager(global.contentMetaClient, "");
        }
        global.storageMeta.load();

        const contentID = UrlService.getParam("contentId");
        if (notebookID & contentID) {
          const nodeKey = 
            'contents_nodes_' 
              + user.id
              + '_' 
              + notebookID 
              +'_'
              + contentID;
          global.storageNodes = new StorageManager(global.contentNodesClient, nodeKey);
        } else {
          global.storageNodes = new StorageManager(global.contentNodesClient, "");
        }
        global.storageNodes.load()
    }

    global.session.onChangeUser(loadNotebooksForCurrentUser);
    loadNotebooksForCurrentUser(session.getCurrentUser());
  })(window, INITIAL_ITEMS);
  