function mountEditor(document, editor,  memory, creator, searchClient) {
      const [createBlock, setCaretToEnd] = FactoryCreateBlock(
        document, 
        editor, 
        creator, 
        true,
        {
          currentNotebookId: "2",
          currentContentId: "5",
          saveNodes: () => console.log(memory), 
          removeNode: (id) => {
              const index = memory.nodes.findIndex(node => node.id === id);
              if (index == -1) {
                return new Error("Node não encontrado. Delete não executado");
              }
              memory.nodes.splice(index, 1);
              return;
          },
          moveNode: (draggedId, targetId, after) => {
            console.log("moveNode: ",draggedId, targetId, after)
            const fromIndex = memory.nodes.findIndex(n => n.id == draggedId);
            if (fromIndex < 0) return;
            const [moved] = memory.nodes.splice(fromIndex, 1);

            const targetIndex = memory.nodes.findIndex(n => n.id == targetId);

            let toIndex = after ? targetIndex + 1 : targetIndex;
            
            toIndex = Math.max(0, Math.min(memory.nodes.length, toIndex));

            memory.nodes.splice(toIndex, 0, moved);

            memory.nodes.forEach((n, idx) => { n.position = idx; });
          },
          addNewNode: (nodeType, position=0) => {
                const nextId = memory._nextId !== undefined
                    ? memory._nextId++
                    : (memory._nextId = memory.nodes.length);

                // 2) monta o novo node
                const newNode = {
                    type: nodeType,
                    position: position,       // vai ser ajustado abaixo
                    customStyle: "",
                    id: nextId,
                    value: "",
                };

                // 3) garante que a posição está dentro dos limites
                const idx = Math.max(0, Math.min(memory.nodes.length, position));

                // 4) insere no array existente, em vez de recriar
                memory.nodes.splice(idx, 0, newNode);

                // 5) reatribui position pra todo mundo
                memory.nodes.forEach((n, i) => {
                    n.position = i;
                });

                return newNode;        
          },
          onGoToNode: (nodeId) => {
            console.log("Ir para nó com ID:", nodeId);
          },
          search: (arg) => searchClient.search(arg),
          getNotebook: (...args) => console.log("getNotebook", args) || ({
            id: "2",
            name: "Algoritmos Avançados",
            description: "Estudo de algoritmos complexos e análise de desempenho.",
            icon: "app-indicator",
            image: "data:image/png;base64,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",
            createdAt: "2025-03-10T10:00:00.000Z",
            updatedAt: "2025-05-20T12:30:00.000Z",
          }),
          getContentMeta: (...args) => console.log("getContentMeta", args) || ({
            icon: "apple",
            tags: [
              { name: "backend", color: "#28a745" },
              { name: "api", color: "#fd7e14" },
            ],
            id: "notebook_1_content_5",
            name: "RESTful APIs",
            content_id: "5",
            notebook_id: "1",
          }), 
          getContentNode: (...args) => console.log("getContentNode", args) || ({
            type: "h1",
            position: 0,
            customStyle: ["center-text", "bigger-text", "background-paper"],
            id: "notebook_3_content_1_node_1",
            notebook_id: "3",
            content_id: "1",
            value: "Título Principal do Documento",
          }),
        })

    memory.nodes.forEach((node, i) => {
      console.log("node", node);
      editor.appendChild(createBlock(node));
    });

  return { createBlock, setCaretToEnd };
};