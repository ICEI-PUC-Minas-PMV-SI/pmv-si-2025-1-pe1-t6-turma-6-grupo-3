
const popular = ['alarm','heart','star','house','gear'];

const input    = document.getElementById('iconSelector');
const preview  = document.getElementById('iconPreview');
const box      = document.getElementById('iconOptions');

// renderiza o dropdown
function renderOptions(list) {
  box.innerHTML = '';
  list.forEach(name => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-group-item list-group-item-action';
    btn.innerHTML = `<i class="bi bi-${name} mr-2"></i> ${name}`;
    btn.addEventListener('click', () => {
      selectIcon(name);
    });
    box.appendChild(btn);
  });
  box.style.display = list.length ? 'block' : 'none';
}

// chama quando o usuário seleciona um ícone
function selectIcon(name) {
  // atualiza preview
  preview.innerHTML = `<i class="bi bi-${name}"></i>`;
  // atualiza o valor do input
  input.value = name;
  // fecha dropdown
  box.style.display = 'none';
}

// abre com populares ao focar
input.addEventListener('focus', () => renderOptions(popular));

// filtra conforme digita
input.addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  if (!term) return renderOptions(popular);
  console.log("Here")
  const filtered = allIcons
    .filter(n => n.includes(term))
    .slice(0, 10);
  renderOptions(filtered);
});

// fecha ao clicar fora
document.addEventListener('click', e => {
  if (!input.contains(e.target) && !box.contains(e.target)) {
    box.style.display = 'none';
  }
});