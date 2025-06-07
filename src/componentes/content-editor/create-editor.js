function mountEditor(document, editor,  memory, creator) {
      const [createBlock, setCaretToEnd] = FactoryCreateBlock(
        document, 
        editor, 
        creator, 
        true,
        {
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
        })

    memory.nodes.forEach((node, i) => {
      console.log("node", node);
      editor.appendChild(createBlock(node));
    });

  return { createBlock, setCaretToEnd };
};