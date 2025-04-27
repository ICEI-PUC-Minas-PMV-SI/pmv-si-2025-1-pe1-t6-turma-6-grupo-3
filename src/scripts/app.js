  
  (function(global, notebooks) {
    'use strict';


    global.notebookClient = new MockNotebookClient(notebooks);
    global.contentMetaClient = new MockContentMetadataClient();
    global.contentNodesClient = new MockContentNodesClient();
    global.UserClient = MockUserApi;

    function loadNotebooksForCurrentUser(user) {
        if (global.storageNB) {
          global.storageNB.save();
        }

        if (global.storageMeta) {
          global.storageMeta.save();
        }

        if (global.storageNode) {
          global.storageNode.save();
        }

        global.storageNB = new StorageManager(global.notebookClient, user);
        global.storageNB.load();

        const notebookID = UrlService.getParam("notebookId");
        if (notebookID) {
          const metaKey = 'contents_meta_' + user + '_' + notebookID;
          global.storageMeta = new StorageManager(global.contentMetaClient, metaKey);
        } else {
          global.storageMeta = new StorageManager(global.contentMetaClient, "");
        }
        global.storageMeta.load();

        const contentID = UrlService.getParam("contentId");
        if (notebookID & contentID) {
          const nodeKey = 'contents_node_' 
            + user 
            + '_' 
            + notebookID 
            +'_'
            + contentID;
          global.storageNode = new StorageManager(global.contentNodesClient, nodeKey);
        } else {
          global.storageNode = new StorageManager(global.contentNodesClient, "");

        }
        global.storageNode.load()
    }

    global.UserClient.onChange(loadNotebooksForCurrentUser);
    global.UserClient.init();

  })(window, INITIAL_ITEMS);
  