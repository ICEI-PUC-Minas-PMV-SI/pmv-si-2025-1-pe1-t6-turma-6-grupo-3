// / Pega os elementos do modal
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeModal');
const inputEditar = document.getElementById('inputEditar');
const salvarBtn = document.getElementById('salvarEdicao');

// Pega o container de tarefas
const containerTasks = document.getElementById('container-tasks');

// Variável para guardar qual task estamos editando
let tarefaSendoEditada = null;

// Função para criar uma nova task
function criarTarefa() {
    const novaTask = document.createElement('div');
    novaTask.classList.add('task');

    novaTask.innerHTML = `
        <input type="checkbox" class="checkb">
        <p>Nova tarefa...</p>
        <button title="Editar" class="abrirModal">✏️</button>
        <button title="Excluir" class="excluir">🗑️</button>
    `;

    containerTasks.appendChild(novaTask);
}

// Evento no botão de criar tarefa
const botaoCriar = document.getElementById('btCriarTarefa');
botaoCriar.addEventListener('click', criarTarefa);

// Evento global para abrir o modal (editar)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('abrirModal')) {
        const task = e.target.closest('.task');
        const textoTask = task.querySelector('p').innerText;

        inputEditar.value = textoTask; // Preenche o input com o texto atual
        tarefaSendoEditada = task; // Guarda qual task estamos editando

        modal.style.display = 'flex'; // Abre o modal
    }
});

// Botão de salvar edição
salvarBtn.addEventListener('click', () => {
    if (tarefaSendoEditada) {
        const novoTexto = inputEditar.value.trim();

        if (novoTexto !== '') {
            tarefaSendoEditada.querySelector('p').innerText = novoTexto;
        }

        modal.style.display = 'none'; // Fecha o modal
        tarefaSendoEditada = null; // Limpa a variável
    }
});

// Fechar modal no X
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    tarefaSendoEditada = null;
});

// Fechar modal clicando fora da caixa
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        tarefaSendoEditada = null;
    }
});

// Evento global para excluir task
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('excluir')) {
        const task = e.target.closest('.task');
        task.remove();
    }
});