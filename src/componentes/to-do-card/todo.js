// Pega o container de tarefas
const containerTasks = document.getElementById('container-tasks');

// Função para criar uma nova task
function criarTarefa(parent = containerTasks) {
    const linhaTask = document.createElement('div');
    linhaTask.classList.add('linha-task');

    linhaTask.innerHTML = `
        <button class="btnmenu" title="Menu">⋮⋮</button>
        <div class="task">
            <input type="checkbox" class="checkb">
            <p class="texto-task">Nova tarefa...</p>

            <div class="acoes-task">
                <span class="tag">Tag</span>

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

// Evento no botão de criar tarefa
const botaoCriar = document.getElementById('btCriarTarefa');
botaoCriar.addEventListener('click', () => criarTarefa());

function abrirMenu(e) {
    fecharMenus(); // Fecha outros menus
    const btn = e.target;
    
    const menu = document.createElement('div');
    menu.classList.add('menu-opcoes');
    menu.innerHTML = `
        <button class="op-excluir-tag">Excluir Tag</button>
        <button class="op-adicionar-subp">Adicionar Subparágrafo</button>
        <button class="op-adicionar-subtask">Adicionar Subtarefa</button>
    `;

    btn.parentElement.appendChild(menu);

    // Eventos do menu
    menu.querySelector('.op-excluir-tag').addEventListener('click', () => {
        const tag = btn.parentElement.querySelector('.tag');
        if (tag) tag.remove();
        fecharMenus();
    });

    menu.querySelector('.op-adicionar-subp').addEventListener('click', () => {
        const task = btn.parentElement.querySelector('.task');

    // Verifica se já existe uma descrição
    if (!task.querySelector('.descricao-task')) {
        const descricao = document.createElement('p');
        descricao.classList.add('descricao-task');
        descricao.innerText = "Descrição da tarefa...";
        descricao.setAttribute('contenteditable', 'true');
        task.insertBefore(descricao, task.querySelector('.acoes-task'));

        // Quando sair do foco, salva o conteúdo
        descricao.addEventListener('blur', () => {
            if (descricao.innerText.trim() === "") {
                descricao.remove(); // remove se estiver vazio
            }
        });
    }
    fecharMenus();
});
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
                    <span class="tag">Tag</span>
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
}

// Fecha todos os menus de opções abertos
function fecharMenus() {
    document.querySelectorAll('.menu-opcoes').forEach(menu => menu.remove());
}

// Evento global para detectar cliques em qualquer .btnmenu
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btnmenu')) {
        e.stopPropagation();
        abrirMenu(e);
    } else {
        fecharMenus();
    }

    // Excluir tarefa
    if (e.target.classList.contains('excluir')) {
        const linhaTask = e.target.closest('.linha-task');
        linhaTask.remove();
    }

    // Editar tarefa
    if (e.target.classList.contains('abrirModal')) {
        const task = e.target.closest('.task');
        const paragrafo = task.querySelector('p.texto-task');
        const tag = task.querySelector('.tag');

        const input = document.createElement('input');
        input.type = 'text';
        input.value = paragrafo.innerText;
        input.classList.add('input-edicao');
        task.replaceChild(input, paragrafo);
        input.focus();

        if (tag) {
            tag.setAttribute('contenteditable', 'true');
            tag.focus();
            tag.addEventListener('blur', () => tag.removeAttribute('contenteditable'));
        }

        input.addEventListener('blur', () => finalizarEdicaoTexto(task, input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    }
});

function finalizarEdicaoTexto(task, input) {
    const novoTexto = input.value.trim() || "Tarefa sem nome";
    const novoP = document.createElement('p');
    novoP.innerText = novoTexto;
    novoP.classList.add('texto-task');
    task.replaceChild(novoP, input);

    const tag = task.querySelector('.tag');
    if (tag) tag.removeAttribute('contenteditable');
}