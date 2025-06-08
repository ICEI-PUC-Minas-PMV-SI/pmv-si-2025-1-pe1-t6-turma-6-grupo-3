function FactoryCreateBlock(
    document,
    editor,
    creator,
    editable,
    {
        currentNotebookId,
        currentContentId,
        onGoToNode,
        search,
        getNotebook,
        getContentMeta,
        getContentNode,
        addNewNode,
        removeNode,
        updateNode,
        moveNode,
        saveNodes,
    }
) {

    console.log("bookmark args in editor", {
        currentNotebookId,
        currentContentId,
        onGoToNode,
        search,
        getNotebook,
        getContentMeta,
        getContentNode,
    })
    function getBlock() {
        const block = document.createElement("div");
        block.className = "block";
        return block;
    }

    function getControls() {
        const controls = document.createElement("div");
        controls.className = "block-controls";
        return controls;
    }

    function getMenuBtn(){
        const menuBtn = document.createElement("button");
        menuBtn.className = "menuBtn";
        menuBtn.title = "Arraste para mover\nClique para abrir o menu";
        menuBtn.textContent = "⋮⋮";
        menuBtn.draggable = true;

        return menuBtn;
    }

    function getListElement(listType, value) {
        const items = value.split("\t");
        const lis = items.map(li_value => `<li>${li_value&&li_value}</li>`).join("");
        const ul =  `<${listType}>${lis}</${listType}>`;
        return ul;
    }

    function getActionListElement(listType, value, onUpdateCheckbox) {
        const items = value.split("\t");

        const list = document.createElement(listType);
        if (listType === "ul") {
            list.style.listStyle = "none";
            list.style.paddingLeft = "0";
        }

        items.forEach((txt, i) => {
            let checked = false;
            let label   = txt;

            if (txt.startsWith("+")) {
                checked = true;
                label   = txt.slice(1);
            } else if (txt.startsWith("-")) {
                checked = false;
                label   = txt.slice(1);
            }
            label = label.trim();

            const li = document.createElement("li");
            li.classList.add("d-flex", "align-items-center", "mb-2");

            const input = document.createElement("input");
            input.type = "checkbox";
            input.checked = checked;
            input.classList.add("form-check-input", "me-2");

            input.addEventListener("change", e => {
                onUpdateCheckbox(i, e.target.checked);
            });

            const span = document.createElement("span");
            span.textContent = label;

            li.append(input, span);
            list.appendChild(li);
        });

        return list;
    }
    

    function render({type, position, customStyle, id, value},{ onUpdateCheckbox, onSelectBookmark }, content) {
        content.style.cssText = '';
        content.innerHTML = '';
        switch(type) {
        case "h1":
            content.innerText = value;
            content.style.fontSize = "24px";
            content.style.fontWeight = "bold";
            break;
        case "paragraph": 
            content.innerText = value;
            content.style.fontSize = "16px";
            break;
        case "ordered_list": 
            const ol = getListElement("ol", value);
            content.innerHTML = ol;
            content.style.fontSize = "16px";
            content.style.fontWeight = "normal";
            break;
        case "unordered_list": 
            const ul = getListElement("ul", value);
            content.innerHTML = ul;
            content.style.fontSize = "16px";
            content.style.fontWeight = "normal";
            break;
        case "ordered_action_list": 
            const aol = getActionListElement("ol", value, onUpdateCheckbox);
            content.appendChild(aol);
            content.style.fontSize = "16px";
            content.style.fontWeight = "normal";
            break;
        case "unordered_action_list": 
            const aul = getActionListElement("ul", value, onUpdateCheckbox);
            content.appendChild(aul);
            content.style.fontSize = "16px";
            content.style.fontWeight = "normal";
            break;
        case "image": 
            // todo: delegate update to function creator
            const img = creator.createImageSelector({ id, value });
            content.appendChild(img);
            break;
        case "bookmark-internal": 
            const bookmark = creator.createInternalBookmarkSelector({
                currentContentId,
                currentNotebookId,
                selected: value,
                id,
                onSelect: (item) => onSelectBookmark(item),
                onGoToNode,
                search,
                getNotebook,
                getContentMeta,
                getContentNode,
            });
            content.contentEditable = false;
            content.appendChild(bookmark);
            break;
        }
    }

    function getMenu({actions}) {
        const {deleteMe, addNewBlock} = actions;

        const menu = document.createElement("div");
        menu.className = "menu";


        const addSeparator = document.createElement("button");
        addSeparator.textContent = "+ Adicionar";
        addSeparator.disabled = true;
        menu.appendChild(addSeparator);
        // const colorPickerBtn = document.createElement("div");
        // colorPickerBtn.className = "color-picker";

        // const colorLabel = document.createElement("span");
        // colorLabel.textContent = "🎨 Cor do bloco:";

        // const colorInput = document.createElement("input");
        // colorInput.type = "color";
        // colorInput.value = "#ffffff";

        // const colorIndicator = document.createElement("div");
        // colorIndicator.className = "color-indicator";
        // colorIndicator.style.backgroundColor = "#ffffff";

        // colorInput.addEventListener("input", () => {
        //   block.style.backgroundColor = colorInput.value;
        //   colorIndicator.style.backgroundColor = colorInput.value;
        // });

        // colorPickerBtn.appendChild(colorLabel);
        // colorPickerBtn.appendChild(colorInput);
        // colorPickerBtn.appendChild(colorIndicator);

        const addTitleBtn = document.createElement("button");
        addTitleBtn.textContent = "🔠 Título H1";
        addTitleBtn.style.paddingLeft = "20px";
        addTitleBtn.onclick = () => {
         addNewBlock("h1");
        };
        menu.appendChild(addTitleBtn);

        const addImageBtn = document.createElement("button");
        addImageBtn.textContent = "🖼️ Imagem";
        addImageBtn.style.paddingLeft = "20px";

        addImageBtn.onclick = () => {
         addNewBlock("image");
        };
        menu.appendChild(addImageBtn);

        const addBookmarkBtn = document.createElement("button");
        addBookmarkBtn.textContent = "🔗 Link Interno";
        addBookmarkBtn.style.paddingLeft = "20px";

        addBookmarkBtn.onclick = () => {
         addNewBlock("bookmark-internal");
        };
        menu.appendChild(addBookmarkBtn);

        const addParagraphBtn = document.createElement("button");
        addParagraphBtn.textContent = "📜 Parágrafo";
        addParagraphBtn.style.paddingLeft = "20px";
        addParagraphBtn.onclick = () => {
          addNewBlock("paragraph");
        };
        menu.appendChild(addParagraphBtn);


        const addBulletListBtn = document.createElement("button");
        addBulletListBtn.textContent = "• Lista com Marcadores";
        addBulletListBtn.style.paddingLeft = "20px";
        addBulletListBtn.onclick = () => {
            addNewBlock("unordered_list");
        };
        menu.appendChild(addBulletListBtn);


        const addOrderedListBtn = document.createElement("button");
        addOrderedListBtn.textContent = "1️⃣ Lista Ordenada";
        addOrderedListBtn.style.paddingLeft = "20px";
        addOrderedListBtn.onclick = () => {
            addNewBlock("ordered_list");
        };
        menu.appendChild(addOrderedListBtn);


        const addActionListBtn = document.createElement("button");
        addActionListBtn.textContent = "✅ Checklist Simples";
        addActionListBtn.style.paddingLeft = "20px";
        addActionListBtn.onclick = () => {
            addNewBlock("unordered_action_list");
        };
        menu.appendChild(addActionListBtn);


        const addOrderedActionListBtn = document.createElement("button");
        addOrderedActionListBtn.textContent = "☑️ Checklist Ordenado";
        addOrderedActionListBtn.style.paddingLeft = "20px";
        addOrderedActionListBtn.onclick = () => {
            addNewBlock("ordered_action_list");
        };
        menu.appendChild(addOrderedActionListBtn);



        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️ Excluir bloco";
        deleteBtn.onclick = deleteMe;
        menu.appendChild(deleteBtn);

        // const numberListBtn = document.createElement("button");
        // numberListBtn.textContent = "1️⃣ Lista Numerada";
        // numberListBtn.onclick = () => {
        //   removeCheckbox();
        //   content.innerHTML = '<ol><li>Item 1</li><li>Item 2</li></ol>';
        //   content.style.fontSize = "16px";
        //   content.style.fontWeight = "normal";
        // };

        // const duplicateBtn = document.createElement("button");
        // duplicateBtn.textContent = "📋 Duplicar";
        // duplicateBtn.onclick = () => {
        //   const copy = createBlock();
        //   copy.querySelector(".content").innerText = content.innerText;
        //   copy.style.backgroundColor = block.style.backgroundColor;  // Copiar a cor de fundo
        //   editor.insertBefore(copy, block.nextSibling);
        //   copy.querySelector(".content").focus();
        // };

        // const commentBtn = document.createElement("button");
        // commentBtn.textContent = "💬 Adicionar Comentário";
        // commentBtn.onclick = () => {
        //   if (!block.querySelector(".comment")) {
        //     const comment = document.createElement("div");
        //     comment.className = "comment";
        //     comment.contentEditable = true;
        //     comment.textContent = "";
        //     block.appendChild(comment);
        //     comment.focus();
        //   }
        // };

        // const addImageBtn = document.createElement("button");
        // addImageBtn.textContent = "🖼️ Adicionar Imagem";
        // addImageBtn.onclick = () => {
        //   const imageUrl = prompt("Digite a URL da imagem:");
        //   if (imageUrl) {
        //     const img = document.createElement("img");
        //     img.src = imageUrl;
        //     img.style.width = "100%";
        //     block.appendChild(img);
        //   }
        // };

        // const removeImageBtn = document.createElement("button");
        // removeImageBtn.textContent = "❌ Remover Imagem";
        // removeImageBtn.onclick = () => {
        //   const img = block.querySelector("img");
        //   if (img) img.remove();
        // };

        // const boldBtn = document.createElement("button");
        // boldBtn.textContent = "🅱️ Negrito";
        // boldBtn.onclick = () => {
        //   document.execCommand("bold");
        // };

        // const italicBtn = document.createElement("button");
        // italicBtn.textContent = "𝓘 Itálico";
        // italicBtn.onclick = () => {
        //   document.execCommand("italic");
        // };

        // const underlineBtn = document.createElement("button");
        // underlineBtn.textContent = "🖋️ Sublinhado";
        // underlineBtn.onclick = () => {
        //   document.execCommand("underline");
        // };

        
        // };

        // menu.appendChild(colorPickerBtn);
        // menu.appendChild(titleBtn);
        // menu.appendChild(paragraphBtn);
        // menu.appendChild(bulletListBtn);
        // menu.appendChild(numberListBtn);
        // menu.appendChild(duplicateBtn);
        // menu.appendChild(commentBtn);
        // menu.appendChild(addImageBtn);
        // menu.appendChild(removeImageBtn);
        // menu.appendChild(boldBtn);
        // menu.appendChild(italicBtn);
        // menu.appendChild(underlineBtn);
        // menu.appendChild(checkboxBtn);
        return menu
    }

    function getContent({onBlur, onEnterPress, onBackspacePress}){
        const content = document.createElement("div");
        content.className = "content";
        content.contentEditable = editable;

        content.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                onEnterPress(e);
            }
            if (e.key === "Backspace") {
                onBackspacePress(e);
            }
        });
        content.addEventListener('blur', onBlur);
     
        return content;
    }

    function extractValueFromContent(node, content) {
        let value = '';
        switch(node.type) {
        case "h1":
        case "paragraph": 
            value = content.innerHTML;
            break;
        case "ordered_list": 
        case "unordered_list": 
            const ul = content.childNodes[0];
            const lis = ul.children;
            for (let i = 0; i < lis.length; i++) {
                value += lis[i].innerText ? lis[i].innerText + '\t' : '\t';
            }
            break;
        case "ordered_action_list": 
        case "unordered_action_list": 
            for (let li of content.children[0].children) {
                const chk   = li.querySelector('input[type="checkbox"]');
                const label = li.querySelector('span')?.innerText.trim() ?? '';
                // prefixo x = checked, - = unchecked
                value += (chk && chk.checked ? 'x ' : '- ') + label + '\t';
            }
            break;
        case "image": 
            value = content.children[0].children[1].children[1].src;
            break;
        case "bookmark-internal":
            console.log("VALUE BOOKMARK", content)
            const raw = content.children[0].value;
            value =  raw && JSON.parse(raw);
            break;
        } 
        return value;
    }

    // helper: posiciona o caret no fim de um elemento
    function setCaretToEnd(el) {
        el.focus();  // garante que o contenteditable esteja ativo
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);      // false = colapsa no fim do conteúdo

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function createBlock(node) {
        console.log("CREATE_BLOCK:NODE: ",node)
        const {type, position, customStyle, id} = node;
        
        const block = getBlock();
        block.dataset.id = node.id;
       const addNewBlock = (nodeType) => {
        const new_node = addNewNode(nodeType, node.position+1);
        const new_block = createBlock(new_node);
        insertBeforeBlock(new_block, true);
            console.log("ELEMENTS: ", editor.childNodes[new_node.position].children[2].children[0])
            setCaretToEnd(editor.childNodes[new_node.position].children[2].children[0]);
        }
        if (editable) {
             const menu = getMenu({
                actions: {
                    // id => delete no dado
                    deleteMe: () => {
                        console.log("DELETE NODE: ", node.id)
                        err = removeNode(node.id);
                        if (err) {
                            alert(err.message)
                            return
                        }
                        block.remove();
                    },
                    addNewBlock,
                }
            });
            block.appendChild(menu);

            const controls = getControls();
            const menuBtn = getMenuBtn();
            controls.appendChild(menuBtn);
            block.appendChild(controls);

            menuBtn.onclick = (e) => {
                e.stopPropagation();
                console.log("menuBtn.onclick")
                updateValueFromContent();
                saveNodes();
                closeAllMenus();
                menu.style.display = 'flex';
            };

             menuBtn.addEventListener('dragstart', e => {
                draggedBlock = block;
                block.style.opacity = "0.5";
                menuBtn.style.cursor = "grabbing";
                // informar qual bloco está sendo arrastado
                e.dataTransfer.setData('text/plain', node.id);
                e.dataTransfer.effectAllowed = 'move';

            });

            menuBtn.addEventListener('dragend', () => {
                draggedBlock = null;
                block.classList.remove('dragging');
                block.style.opacity = "1";
                menuBtn.style.cursor = "grab";
            });

            block.addEventListener('dragover', (e) => {
                e.preventDefault();
                const rect = block.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                block.classList.remove('drag-over-top', 'drag-over-bottom');

                if (e.clientY < midpoint) {
                    block.classList.add('drag-over-top');
                } else {
                    block.classList.add('drag-over-bottom');
                }
            });

            block.addEventListener('dragleave', () => {
                block.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            block.addEventListener('drop', (e) => {
                console.log("DROP: ", e)
                e.preventDefault();
                block.classList.remove('drag-over-top', 'drag-over-bottom');
                const draggedId = e.dataTransfer.getData('text/plain');
                const targetId  = block.dataset.id;
                const { top, height } = block.getBoundingClientRect();
                const after = (e.clientY - top) > height/2;
                moveNode(draggedId, targetId, after);
                const draggedEl = editor.querySelector(`.block[data-id="${draggedId}"]`);
                insertBeforeBlock(draggedEl, after);
            });

            document.addEventListener('click', () => {
                menu.style.display = 'none';
            });
        }

        const inner = document.createElement("div");
        inner.className = "inner";
        const onUpdateCheckbox = (i, checked) => {
            updateValueFromContent();
        };
        const updateValueFromContent = () => {
            
            const couldBeText = extractValueFromContent(node, content)
            if (typeof couldBeText === typeof ""){
                couldBeText.replaceAll(/\r?\n/g, '')
                    .replace(/\t+$/, '')
                    .replace(/\t- +$/, '');
            }
            const new_value = couldBeText;
             
            console.log('updateValueFromContent||NodeType: ', node.type);
            console.log('updateValueFromContent||OldValue: ', node.value);
            console.log('updateValueFromContent||NewValue: ', new_value);
            node.value = new_value;
            console.log('updateValueFromContent||node: ', node);
        };

        const onSelectBookmark = () => {
            updateValueFromContent()
        }
        const content = getContent({
            onBlur: e => {
                updateValueFromContent()
            },
            onBackspacePress: e => {
                updateValueFromContent();
            },
            onEnterPress: e => {
                let lastItem;
                switch (node.type) {
                case "h1":
                    addNewBlock("h1");
                    break;
                case "paragraph":
                    addNewBlock("paragraph");
                    break;
                case "ordered_list": 
                case "unordered_list": 
                    e.preventDefault();
                    updateValueFromContent();
                    node.value = `${node.value}\t`;
                    render({type, position, customStyle, id, value: node.value}, {onUpdateCheckbox, onSelectBookmark},  content);
                    lastItem = content.childNodes[0].lastElementChild;
                    setCaretToEnd(lastItem);
                    break;
                case "ordered_action_list":
                case "unordered_action_list":
                    e.preventDefault();
                    updateValueFromContent();
                    node.value = `${node.value}\t-`;
                    render({type, position, customStyle, id, value: node.value}, {onUpdateCheckbox, onSelectBookmark},  content);
                    lastItem = content.childNodes[0].lastElementChild;
                    setCaretToEnd(lastItem);
                break;
                }
            }
        });
        render({
            type, 
            position, 
            customStyle, 
            id, 
            value: node.value
        }, 
        {onUpdateCheckbox, onSelectBookmark }, 
        content,
        );
        inner.appendChild(content);
        block.appendChild(inner);

    
        function insertBeforeBlock(targetEl, after){
            editor.insertBefore(
               targetEl,
                after ? block.nextSibling : block
            );
        }

        return block;
    }

    function closeAllMenus() {
        document.querySelectorAll('.menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }

   
    return [createBlock, setCaretToEnd];
}
