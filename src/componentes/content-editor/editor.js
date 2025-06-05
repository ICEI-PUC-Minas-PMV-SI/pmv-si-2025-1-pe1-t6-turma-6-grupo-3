function FactoryCreateBlock(
    doc,
    editor,
    creator,
    {
        addNewNode,
        removeNode,
        updateNode,
        moveNode,
        saveNodes,
    }
) {
    function getBlock() {
        const block = doc.createElement("div");
        block.className = "block";
        return block;
    }

    function getControls() {
        const controls = doc.createElement("div");
        controls.className = "block-controls";
        return controls;
    }

    function getAddBtn() {
        const addBtn = doc.createElement("button");
        addBtn.textContent = "+";
        addBtn.onclick = () => {
        const newBlock = createBlock();
        editor.insertBefore(newBlock, block.nextSibling);
        newBlock.querySelector(".content").focus();
        };
        return addBtn
    }

    function getMenuBtn(){
        const menuBtn = doc.createElement("button");
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

        const list = doc.createElement(listType);
        if (listType === "ul") {
            list.style.listStyle = "none";
            list.style.paddingLeft = "0";
        }

        items.forEach((txt, i) => {
            let checked = false;
            let label   = txt;

            if (txt.startsWith("x")) {
                checked = true;
                label   = txt.slice(1);
            } else if (txt.startsWith("-")) {
                checked = false;
                label   = txt.slice(1);
            }
            label = label.trim();

            const li = doc.createElement("li");
            li.classList.add("d-flex", "align-items-center", "mb-2");

            const input = doc.createElement("input");
            input.type = "checkbox";
            input.checked = checked;
            input.classList.add("form-check-input", "me-2");

            input.addEventListener("change", e => {
                onUpdateCheckbox(i, e.target.checked);
            });

            const span = doc.createElement("span");
            span.textContent = label;

            li.append(input, span);
            list.appendChild(li);
        });

        return list;
    }
    

    function render({type, position, customStyle, id, value},{ onUpdateCheckbox }, content) {
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
        case "link_bookmark": 
            break;
        }
    }

    function getMenu({actions}) {
        const {deleteMe, addNewBlock} = actions;

        const menu = doc.createElement("div");
        menu.className = "menu";


        const addSeparator = doc.createElement("button");
        addSeparator.textContent = "+ Adicionar";
        addSeparator.disabled = true;
        menu.appendChild(addSeparator);
        // const colorPickerBtn = doc.createElement("div");
        // colorPickerBtn.className = "color-picker";

        // const colorLabel = doc.createElement("span");
        // colorLabel.textContent = "🎨 Cor do bloco:";

        // const colorInput = doc.createElement("input");
        // colorInput.type = "color";
        // colorInput.value = "#ffffff";

        // const colorIndicator = doc.createElement("div");
        // colorIndicator.className = "color-indicator";
        // colorIndicator.style.backgroundColor = "#ffffff";

        // colorInput.addEventListener("input", () => {
        //   block.style.backgroundColor = colorInput.value;
        //   colorIndicator.style.backgroundColor = colorInput.value;
        // });

        // colorPickerBtn.appendChild(colorLabel);
        // colorPickerBtn.appendChild(colorInput);
        // colorPickerBtn.appendChild(colorIndicator);

        const addTitleBtn = doc.createElement("button");
        addTitleBtn.textContent = "🔠 Título H1";
        addTitleBtn.style.paddingLeft = "20px";

        const addImageBtn = doc.createElement("button");
        addImageBtn.textContent = "🖼️ Imagem";
        addImageBtn.style.paddingLeft = "20px";

        addImageBtn.onclick = () => {
         addNewBlock("image");
        };
        menu.appendChild(addImageBtn);

        const addParagraphBtn = doc.createElement("button");
        addParagraphBtn.textContent = "📜 Parágrafo";
        addParagraphBtn.style.paddingLeft = "20px";
        addParagraphBtn.onclick = () => {
          addNewBlock("paragraph");
        };
        menu.appendChild(addParagraphBtn);


        const addBulletListBtn = doc.createElement("button");
        addBulletListBtn.textContent = "• Lista com Marcadores";
        addBulletListBtn.style.paddingLeft = "20px";
        addBulletListBtn.onclick = () => {
            addNewBlock("unordered_list");
        };
        menu.appendChild(addBulletListBtn);


        const addOrderedListBtn = doc.createElement("button");
        addOrderedListBtn.textContent = "1️⃣ Lista Ordenada";
        addOrderedListBtn.style.paddingLeft = "20px";
        addOrderedListBtn.onclick = () => {
            addNewBlock("ordered_list");
        };
        menu.appendChild(addOrderedListBtn);


        const addActionListBtn = doc.createElement("button");
        addActionListBtn.textContent = "✅ Checklist Simples";
        addActionListBtn.style.paddingLeft = "20px";
        addActionListBtn.onclick = () => {
            addNewBlock("unordered_action_list");
        };
        menu.appendChild(addActionListBtn);


        const addOrderedActionListBtn = doc.createElement("button");
        addOrderedActionListBtn.textContent = "☑️ Checklist Ordenado";
        addOrderedActionListBtn.style.paddingLeft = "20px";
        addOrderedActionListBtn.onclick = () => {
            addNewBlock("ordered_action_list");
        };
        menu.appendChild(addOrderedActionListBtn);



        const deleteBtn = doc.createElement("button");
        deleteBtn.textContent = "🗑️ Excluir bloco";
        deleteBtn.onclick = deleteMe;
        menu.appendChild(deleteBtn);

        // const numberListBtn = doc.createElement("button");
        // numberListBtn.textContent = "1️⃣ Lista Numerada";
        // numberListBtn.onclick = () => {
        //   removeCheckbox();
        //   content.innerHTML = '<ol><li>Item 1</li><li>Item 2</li></ol>';
        //   content.style.fontSize = "16px";
        //   content.style.fontWeight = "normal";
        // };

        // const duplicateBtn = doc.createElement("button");
        // duplicateBtn.textContent = "📋 Duplicar";
        // duplicateBtn.onclick = () => {
        //   const copy = createBlock();
        //   copy.querySelector(".content").innerText = content.innerText;
        //   copy.style.backgroundColor = block.style.backgroundColor;  // Copiar a cor de fundo
        //   editor.insertBefore(copy, block.nextSibling);
        //   copy.querySelector(".content").focus();
        // };

        // const commentBtn = doc.createElement("button");
        // commentBtn.textContent = "💬 Adicionar Comentário";
        // commentBtn.onclick = () => {
        //   if (!block.querySelector(".comment")) {
        //     const comment = doc.createElement("div");
        //     comment.className = "comment";
        //     comment.contentEditable = true;
        //     comment.textContent = "";
        //     block.appendChild(comment);
        //     comment.focus();
        //   }
        // };

        // const addImageBtn = doc.createElement("button");
        // addImageBtn.textContent = "🖼️ Adicionar Imagem";
        // addImageBtn.onclick = () => {
        //   const imageUrl = prompt("Digite a URL da imagem:");
        //   if (imageUrl) {
        //     const img = doc.createElement("img");
        //     img.src = imageUrl;
        //     img.style.width = "100%";
        //     block.appendChild(img);
        //   }
        // };

        // const removeImageBtn = doc.createElement("button");
        // removeImageBtn.textContent = "❌ Remover Imagem";
        // removeImageBtn.onclick = () => {
        //   const img = block.querySelector("img");
        //   if (img) img.remove();
        // };

        // const boldBtn = doc.createElement("button");
        // boldBtn.textContent = "🅱️ Negrito";
        // boldBtn.onclick = () => {
        //   doc.execCommand("bold");
        // };

        // const italicBtn = doc.createElement("button");
        // italicBtn.textContent = "𝓘 Itálico";
        // italicBtn.onclick = () => {
        //   doc.execCommand("italic");
        // };

        // const underlineBtn = doc.createElement("button");
        // underlineBtn.textContent = "🖋️ Sublinhado";
        // underlineBtn.onclick = () => {
        //   doc.execCommand("underline");
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
        const content = doc.createElement("div");
        content.className = "content";
        content.contentEditable = true;

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
            console.log("IMAGE", content.children[0]);
            console.log("IMAGE.src", content.children[0].children[1].src);
            value = content.children[0].children[1].children[1].src;
            break;
        case "link_bookmark": 
            break;
        } 
        return value;
    }

    // helper: posiciona o caret no fim de um elemento
    function setCaretToEnd(el) {
        el.focus();  // garante que o contenteditable esteja ativo
        const range = doc.createRange();
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
                addNewBlock: (nodeType) => {
                   const new_node = addNewNode(nodeType, node.position+1);
                   const new_block = createBlock(new_node);
                   insertBeforeBlock(new_block, true);
                    console.log("ELEMENTS: ", editor.childNodes[new_node.position].children[2].children[0])
                    setCaretToEnd(editor.childNodes[new_node.position].children[2].children[0]);
                },
            }
        });

        const controls = getControls();

        const addBtn = getAddBtn();

        const menuBtn = getMenuBtn();

        block.appendChild(menu);

        menuBtn.onclick = (e) => {
            e.stopPropagation();
            console.log("menuBtn.onclick")
            saveNodes();
            closeAllMenus();
            menu.style.display = 'flex';
        };

        controls.appendChild(addBtn);
        controls.appendChild(menuBtn);
        block.appendChild(controls);

        const inner = doc.createElement("div");
        inner.className = "inner";
        const onUpdateCheckbox = (i, checked) => {
            updateValueFromContent();
        };
        const updateValueFromContent = () => {
            const new_value = extractValueFromContent(node, content)
                .replaceAll(/\r?\n/g, '')
                .replace(/\t+$/, '')
                .replace(/\t- +$/, '');
            console.log('updateValueFromContent||NodeType: ', node.type);
            console.log('updateValueFromContent||OldValue: ', node.value);
            console.log('updateValueFromContent||NewValue: ', new_value);
            node.value = new_value;
            console.log('updateValueFromContent||node: ', node);
        };
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
                case "ordered_list": 
                case "unordered_list": 
                    e.preventDefault();
                    updateValueFromContent();
                    node.value = `${node.value}\t`;
                    render({type, position, customStyle, id, value: node.value}, {onUpdateCheckbox},  content);
                    lastItem = content.childNodes[0].lastElementChild;
                    setCaretToEnd(lastItem);
                    break;
                case "ordered_action_list":
                case "unordered_action_list":
                    e.preventDefault();
                    updateValueFromContent();
                    node.value = `${node.value}\t-`;
                    render({type, position, customStyle, id, value: node.value}, {onUpdateCheckbox},  content);
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
        {onUpdateCheckbox}, 
        content,
        );
        inner.appendChild(content);
        block.appendChild(inner);

        

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

        doc.addEventListener('click', () => {
            menu.style.display = 'none';
        });
        function insertBeforeBlock(targetEl, after){
            editor.insertBefore(
               targetEl,
                after ? block.nextSibling : block
            );
        }

        return block;
    }

    function closeAllMenus() {
        doc.querySelectorAll('.menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }

   
    return [createBlock, setCaretToEnd];
}
