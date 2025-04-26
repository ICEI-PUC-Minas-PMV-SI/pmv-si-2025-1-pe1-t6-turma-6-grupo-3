  
  (function(global, initial) {
    'use strict';

    // expõe no escopo global
    global.MockNotebookClient = MockNotebookClient;
    global.StorageManager = StorageManager;
    global.notebookClient = new MockNotebookClient(initial);
    global.storage = new StorageManager(global.apiClient, 'myNotebooks');
  
  })(window, INITIAL_ITEMS);
  