// Pega o container de tarefas
const containerTasks = document.getElementById('container-tasks');

// Função para criar uma nova tarefa
function criarTarefa(parent = containerTasks) {
    const linhaTask = document.createElement('div');
    linhaTask.classList.add('linha-task');

    linhaTask.innerHTML = `
        <div class="task">
            <button class="btnmenu" title="Menu">⋮⋮</button>
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
            <div class="task">
                <button class="btnmenu" title="Menu">⋮⋮</button>
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
                    <button title="Excluir" class="excluir">🗑️</button>
                </div>
            </div>
        `;
        parentTask.appendChild(subtask);
        fecharMenus();
    });

// Adicionar tag
menu.querySelector('.op-adicionar-tag').addEventListener('click', () => {
        const span = document.createElement('span');
        span.classList.add('tag');
        span.setAttribute('contenteditable', 'true');
        span.setAttribute('data-placeholder', 'Tag'); // <- define o "placeholder"

        // Evita quebra de linha com Enter
        span.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                span.blur();
            }
        });

        span.addEventListener('click', () => {
            span.focus();
        });

        task.querySelector('.acoes-task').prepend(span);
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

 // Permite edição direta do título e descrição ao clicar
document.addEventListener('click', (e) => {
    const el = e.target;

    // Editar título
    if (el.classList.contains('texto-task')) {
        const task = el.closest('.task');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = el.innerText;
        input.classList.add('input-edicao');
        task.replaceChild(input, el);
        input.focus();

        input.addEventListener('blur', () => finalizarEdicaoTexto(task, input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    }

    // Editar descrição
    if (el.classList.contains('descricao-task')) {
        const task = el.closest('.task');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = el.innerText;
        input.classList.add('input-edicao');
        task.replaceChild(input, el);
        input.focus();

        input.addEventListener('blur', () => finalizarEdicaoDescricao(task, input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
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

    // Finaliza edição da descrição
    function finalizarEdicaoDescricao(task, input) {
        const novaDescricao = input.value.trim() || "Sem descrição";
        const novoP = document.createElement('p');
        novoP.innerText = novaDescricao;
        novoP.classList.add('descricao-task');
        task.replaceChild(novoP, input);
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
