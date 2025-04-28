  
  (function(global, notebooks) {
    'use strict';

    // expõe no escopo global
    global.StorageManager = StorageManager;

    global.notebookClient = new MockNotebookClient(notebooks);
    global.contentMetaClient = new MockContentMetadataClient();
    console.log("-----",   global.contentMetaClient.getAll())
    global.UserClient = MockUserApi;

    function loadNotebooksForCurrentUser(user) {
        if (global.storageNB) {
          global.storageNB.save();
        }

        if (global.storageMeta) {
          global.storageMeta.save();
        }

        global.storageNB = new global.StorageManager(global.notebookClient, user);
        global.storageNB.load();

        const notebookID = UrlService.getParam("notebookId");
        if (notebookID) {
          const metaKey = 'contents_meta_' + user + '_' + notebookID;
          global.storageMeta = new StorageManager(global.contentMetaClient, metaKey);
        } else {
          global.storageMeta = new StorageManager(global.contentMetaClient, "");
        }
        global.storageMeta.load();
    }

    global.UserClient.onChange(loadNotebooksForCurrentUser);
    global.UserClient.init();

  })(window, INITIAL_ITEMS);
  