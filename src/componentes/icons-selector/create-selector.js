/**
 * Cria um Icon Selector componentizado via template.
 *
 * @param {Document} document 
 * @param {Element} wrapper — onde está o template (#modal-icon-selector-template)
 * @param {Object} opts
 *   - name: string            — name do input
 *   - label: string           — texto do <label>
 *   - placeholder?: string    — placeholder do input
 *   - popular: string[]       — lista inicial de ícones populares
 *   - allIcons: string[]      — lista completa de ícones para busca
 *   - actions?: {             — handlers de evento
 *       select?: (name, el) => void
 *     }
 *
 * @returns {HTMLElement} — o elemento `.icon-selector-field`
 */
function createIconSelector(document, wrapper, {
  name,
  label = '',
  placeholder = '',
  popular = [],
  allIcons = [],
  customClass = [],
  actions = {}
}) {
  const tmpl    = wrapper.querySelector('#icon-selector-template').content;
  const fragment= document.importNode(tmpl, true);
  const fieldEl = fragment.querySelector('[data-element-type="icon-selector"]');
  const labelEl = fieldEl.querySelector('[data-element-type="label"]');
  const inputEl = fieldEl.querySelector('[data-element-type="input"]');
  const preview = fieldEl.querySelector('[data-element-type="preview"]');
  const box     = fieldEl.querySelector('[data-element-type="options"]');

  // atributos básicos
  labelEl.innerText       = label;
  inputEl.name            = name;
  inputEl.placeholder     = placeholder;
  inputEl.autocomplete    = 'off';

    // Aplica classes customizadas
  customClass.forEach(c => fieldEl.classList.add(c));

  // funções internas
  function renderOptions(list) {
    box.innerHTML = '';
    list.forEach(iconName => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-group-item list-group-item-action';
      btn.innerHTML = `<i class="bi bi-${iconName} mr-2"></i> ${iconName}`;
      btn.addEventListener('click', () => selectIcon(iconName));
      box.appendChild(btn);
    });
    box.classList.toggle('hidden', list.length === 0);
  }

  function selectIcon(iconName) {
    if (!iconName) {
      preview.innerHTML = `<i class="bi bi-question-circle"></i>`;
      inputEl.value = iconName;
       if (actions.select) actions.select(iconName, fieldEl);
       return;
    }
    preview.innerHTML = `<i class="bi bi-${iconName}"></i>`;
    inputEl.value = iconName;
    box.classList.add('hidden');
    if (actions.select) actions.select(iconName, fieldEl);
  }

  // eventos
  inputEl.addEventListener('focus', () => renderOptions(popular));
  inputEl.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    const list = !term
      ? popular
      : allIcons.filter(n => n.includes(term)).slice(0, 10);
    renderOptions(list);
  });

  document.addEventListener('click', e => {
    if (!fieldEl.contains(e.target)) {
      box.classList.add('hidden');
    }
  });

  inputEl.updateValue = selectIcon;

  // começa escondido
  box.classList.add('hidden');

  return fieldEl;
}
