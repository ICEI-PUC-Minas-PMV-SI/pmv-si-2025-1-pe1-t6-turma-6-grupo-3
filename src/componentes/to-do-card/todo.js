// Pega o container de tarefas
const containerTasks = document.getElementById('container-tasks');

// Função para criar uma nova tarefa
function criarTarefa(parent = containerTasks) {
    const linhaTask = document.createElement('div');
    linhaTask.classList.add('linha-task');

    linhaTask.innerHTML = `
        <button class="btnmenu" title="Menu">⋮⋮</button>
        <div class="task">
            <input type="checkbox" class="checkb">
            <p class="texto-task">Nova tarefa...</p>
            <p class="descricao-task">Descrição da tarefa...</p>
            <div class="acoes-task">
                <select class="prioridade">
                    <option value="">Prioridade</option>
                    <option value="">🏳️ Nenhuma</option>
                    <option value="baixa">🏁 Baixa</option>
                    <option value="media">🏴 Média</option>
                    <option value="alta">🚩 Alta</option>
                </select>
                <button title="Editar" class="abrirModal">✏️</button>
                <button title="Excluir" class="excluir">🗑️</button>
            </div>
        </div>
    `;
    parent.appendChild(linhaTask);
}

// Criação de nova tarefa
document.getElementById('btCriarTarefa').addEventListener('click', () => criarTarefa());

// Fecha todos os menus
function fecharMenus() {
    document.querySelectorAll('.menu-opcoes').forEach(m => m.remove());
}

// Abre o menu ao lado do botão
function abrirMenu(e) {
    fecharMenus(); // Fecha outros menus antes de abrir o novo

    const btn = e.target;
    const task = btn.closest('.task');
    if (!task) return;

    const temTag = task.querySelector('.tag');
    const menu = document.createElement('div');
    menu.classList.add('menu-opcoes');

    menu.innerHTML = `
        <div class="menu-section">
            <span class="menu-title">Tarefa</span>
            <button class="op-adicionar-subtask">Subtarefa</button>
        </div>
        <hr>
        <div class="menu-section">
            <span class="menu-title">Tags</span>
            <button class="op-adicionar-tag">Adicionar tag</button>
            ${temTag ? '<button class="op-remover-tag">Remover tag</button>' : ''}
            <div class="sub-menu-colors">
                <span class="menu-title-small">Cor da tag:</span>
                <button class="tag-color" data-color="#0e6eff" style="background:#0e6eff"></button>
                <button class="tag-color" data-color="#ff4d4d" style="background:#ff4d4d"></button>
                <button class="tag-color" data-color="#ff99cc" style="background:#ff99cc"></button>
                <button class="tag-color" data-color="#4cd137" style="background:#4cd137"></button>
                <button class="tag-color" data-color="#f1c40f" style="background:#f1c40f"></button>
                <button class="tag-color" data-color="#e67e22" style="background:#e67e22"></button>
                <button class="tag-color" data-color="#8e44ad" style="background:#8e44ad"></button>
            </div>
        </div>
    `;

    btn.parentElement.appendChild(menu);

    // Subtarefa
    menu.querySelector('.op-adicionar-subtask').addEventListener('click', () => {
        const parentTask = btn.closest('.linha-task');
        const subtask = document.createElement('div');
        subtask.classList.add('linha-task', 'subtask');

        subtask.innerHTML = `
            <button class="btnmenu" title="Menu">⋮⋮</button>
            <div class="task">
                <input type="checkbox" class="checkb">
                <p class="texto-task">Subtarefa...</p>
                <div class="acoes-task">
                    <select class="prioridade">
                        <option value="">Prioridade</option>
                        <option value="">🏳️ Nenhuma</option>
                        <option value="baixa">🏁 Baixa</option>
                        <option value="media">🏴 Média</option>
                        <option value="alta">🚩 Alta</option>
                    </select>
                    <button title="Editar" class="abrirModal">✏️</button>
                    <button title="Excluir" class="excluir">🗑️</button>
                </div>
            </div>
        `;
        parentTask.appendChild(subtask);
        fecharMenus();
    });

    // Adicionar tag
    menu.querySelector('.op-adicionar-tag').addEventListener('click', () => {
        if (!task.querySelector('.tag')) {
            const span = document.createElement('span');
            span.classList.add('tag');
            span.textContent = 'Tag';
            task.querySelector('.acoes-task').prepend(span);
        }
        fecharMenus();
    });

    // Remover tag
    const btnRemover = menu.querySelector('.op-remover-tag');
    if (btnRemover) {
        btnRemover.addEventListener('click', () => {
            const tagEl = task.querySelector('.tag');
            if (tagEl) tagEl.remove();
            fecharMenus();
        });
    }

    // Cor da tag
    menu.querySelectorAll('.tag-color').forEach(b => {
        b.addEventListener('click', () => {
            const tagEl = task.querySelector('.tag');
            if (tagEl) tagEl.style.backgroundColor = b.dataset.color;
            fecharMenus();
        });
    });
}

// Evento global: clique em qualquer botão ou fora
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btnmenu')) {
        e.stopPropagation();
        abrirMenu(e);
    } else {
        fecharMenus();
    }

    // Excluir
    if (e.target.classList.contains('excluir')) {
        e.target.closest('.linha-task').remove();
    }

    // Editar
    if (e.target.classList.contains('abrirModal')) {
        const task = e.target.closest('.task');
        const paragrafo = task.querySelector('p.texto-task');
        const descricao = task.querySelector('.descricao-task');

        const input = document.createElement('input');
        input.type = 'text';
        input.value = paragrafo.innerText;
        input.classList.add('input-edicao');
        task.replaceChild(input, paragrafo);
        input.focus();

        const inputDesc = document.createElement('input');
        inputDesc.type = 'text';
        inputDesc.value = descricao.innerText;
        inputDesc.classList.add('input-edicao');
        descricao.replaceWith(inputDesc);

        input.addEventListener('blur', () => finalizarEdicaoTexto(task, input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });

        inputDesc.addEventListener('blur', () => {
            const novoParagrafo = document.createElement('p');
            novoParagrafo.classList.add('descricao-task');
            novoParagrafo.textContent = inputDesc.value;
            inputDesc.replaceWith(novoParagrafo);
        });

        inputDesc.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') inputDesc.blur();
        });
    }
});

// Finaliza edição do título
function finalizarEdicaoTexto(task, input) {
    const novoTexto = input.value.trim() || "Tarefa sem nome";
    const novoP = document.createElement('p');
    novoP.innerText = novoTexto;
    novoP.classList.add('texto-task');
    task.replaceChild(novoP, input);
}