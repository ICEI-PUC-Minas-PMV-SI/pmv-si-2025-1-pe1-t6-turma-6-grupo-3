// Pega o container de tarefas
const containerTasks = document.getElementById('container-tasks');


// Função para criar uma nova task
function criarTarefa() {
    const novaTask = document.createElement('div');
    novaTask.classList.add('task');

    novaTask.innerHTML = `
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
`;

    containerTasks.appendChild(novaTask);
}

// Evento no botão de criar tarefa
const botaoCriar = document.getElementById('btCriarTarefa');
botaoCriar.addEventListener('click', criarTarefa);


// Evento global para excluir task
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('excluir')) {
        const task = e.target.closest('.task');
        task.remove();
    }
});
// Evento global para editar task (título + tag)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('abrirModal')) {
        const task = e.target.closest('.task');
        const paragrafo = task.querySelector('p');
        const tag = task.querySelector('.tag');

        // Troca <p> por <input>
        const input = document.createElement('input');
        input.type = 'text';
        input.value = paragrafo.innerText;
        input.classList.add('input-edicao');
        task.replaceChild(input, paragrafo);
        input.focus();

        // Ativa edição da tag
        tag.setAttribute('contenteditable', 'true');
        tag.focus();

        // Desativa tag quando clicar fora
        tag.addEventListener('blur', () => {
            tag.removeAttribute('contenteditable');
        });

        // Quando título perder o foco, salva
        input.addEventListener('blur', () => {
            finalizarEdicaoTexto(task, input);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }
});

// Função para salvar o texto
function finalizarEdicaoTexto(task, input) {
    const novoTexto = input.value.trim() || "Tarefa sem nome";
    const novoP = document.createElement('p');
    novoP.innerText = novoTexto;
    novoP.classList.add('texto-task');
    task.replaceChild(novoP, input);

    // Garante que a tag volte a ser não editável
    const tag = task.querySelector('.tag');
    tag.removeAttribute('contenteditable');
}