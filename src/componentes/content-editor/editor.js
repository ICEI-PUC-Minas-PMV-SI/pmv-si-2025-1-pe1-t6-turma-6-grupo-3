function FactoryCreateBlock(document, editor, {
    addNewNode,
    removeNode,
    updateNode,
}) {
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

    function getAddBtn() {
        const addBtn = document.createElement("button");
        addBtn.textContent = "+";
        addBtn.onclick = () => {
        const newBlock = createBlock();
        editor.insertBefore(newBlock, block.nextSibling);
        newBlock.querySelector(".content").focus();
        };
        return addBtn
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

            if (txt.startsWith("x")) {
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
            break;
        case "link_bookmark": 
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
            break;
        case "link_bookmark": 
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
        const {type, position, customStyle, id} = node;
        
        const block = getBlock();
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
                addNewBlock: (nodeType) => addNewNode(nodeType, node.position+1),
            }
        });

        const controls = getControls();

        const addBtn = getAddBtn();

        const menuBtn = getMenuBtn();

        block.appendChild(menu);

        menuBtn.onclick = (e) => {
        e.stopPropagation();
        closeAllMenus();
        menu.style.display = 'flex';
        };

        controls.appendChild(addBtn);
        controls.appendChild(menuBtn);
        block.appendChild(controls);

        const inner = document.createElement("div");
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

        

        menuBtn.addEventListener('dragstart', () => {
            draggedBlock = block;
            block.style.opacity = "0.5";
            menuBtn.style.cursor = "grabbing";
        });

        menuBtn.addEventListener('dragend', () => {
            draggedBlock = null;
            block.style.opacity = "1";
            menuBtn.style.cursor = "grab";
        });

        block.addEventListener('dragover', (e) => {
            e.preventDefault();
            block.classList.add('drag-over');
        });

        block.addEventListener('dragleave', () => {
            block.classList.remove('drag-over');
        });

        block.addEventListener('drop', (e) => {
            e.preventDefault();
            block.classList.remove('drag-over');
            if (draggedBlock && block !== draggedBlock) {
                const offset = e.clientY - block.getBoundingClientRect().top;
                const shouldInsertAfter = offset > block.clientHeight / 2;
                editor.insertBefore(draggedBlock, shouldInsertAfter ? block.nextSibling : block);
            }
        });

        document.addEventListener('click', () => {
            menu.style.display = 'none';
        });

        return block;
    }

    function closeAllMenus() {
        document.querySelectorAll('.menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
    return [createBlock, setCaretToEnd];
}
