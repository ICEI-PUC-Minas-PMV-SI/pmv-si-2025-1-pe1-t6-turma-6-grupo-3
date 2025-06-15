function createTagInput(document, wrapper, {
  name,
  label = '',
  placeholder = '',
  initialTags = [],
  customClasses = [],
  actions = {}
}) {
  const tmpl        = wrapper.querySelector('#tags-input-template').content;
  const fragment    = document.importNode(tmpl, true);
  const fieldEl     = fragment.querySelector('[data-element-type="tag-selector"]');
  const labelEl     = fieldEl.querySelector('[data-element-type="label"]');
  const inputEl     = fieldEl.querySelector('[data-element-type="input"]');
  const tagsEl      = fieldEl.querySelector('[data-element-type="tags-container"]');
  const hiddenInput = fieldEl.querySelector('[data-element-type="hidden-input"]');

  // estado interno
  const tags = [];

  // atributos básicos
  hiddenInput.name    = name;
  labelEl.innerText   = label;
  inputEl.placeholder = placeholder;
  customClasses.forEach(c => fieldEl.classList.add(c));

  // helpers
  function randomColor() {
    return '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');
  }
  function syncHidden() {
    hiddenInput.value = JSON.stringify(tags);
  }

  // cria e retorna a pill com todos os listeners
  function makePill(tagObj) {
    const span = document.createElement('span');
    span.className = 'tag-pill';
    span.style.backgroundColor = tagObj.color;
    span.textContent = tagObj.name;

    // botão de remover
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remove-btn';
    btn.innerText = '×';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeTag(tagObj.name);
    });
    span.appendChild(btn);

    // single-click abre editor
    span.addEventListener('click', e => {
      e.stopPropagation();
      openEditor(span, tagObj);
    });

    return span;
  }

  // abre o editor inline dentro da pill
  function openEditor(pillEl, tagObj) {
    // fecha outros editores existentes
    document.querySelectorAll('.tag-editor').forEach(ed => ed.remove());

    // cria container do editor
    const editor = document.createElement('div');
    editor.className = 'tag-editor';

    // input para renomear
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = tagObj.name;

    // color picker
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = tagObj.color;

    // text input para cor
    const colorText = document.createElement('input');
    colorText.type = 'text';
    colorText.value = tagObj.color;
    colorText.size = 7;

    // botão salvar
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'editor-save-btn';
    saveBtn.innerText = 'OK';

    // sincroniza cor picker ↔ text
    colorInput.addEventListener('input', e => {
      colorText.value = e.target.value;
    });
    colorText.addEventListener('input', e => {
      console.log("input text", e)
      colorInput.value = e.target.value;
    });

    // ao salvar aplica mudanças
    function commit() {
      // renomeia
      if (nameInput.value.trim() && nameInput.value !== tagObj.name) {
        tagObj.name = nameInput.value.trim();
        pillEl.childNodes[0].nodeValue = tagObj.name;
        if (actions.onAdd) actions.onAdd(tagObj.name);
      }
      // muda cor
      if (colorInput.value !== tagObj.color) {
        tagObj.color = colorInput.value;
        pillEl.style.backgroundColor = tagObj.color;
        if (actions.onColorChange) actions.onColorChange(tagObj.name, tagObj.color);
      }
      syncHidden();
      editor.remove();
    }

    saveBtn.addEventListener('click', commit);
    // fecha ao clicar fora
    setTimeout(() => {
      document.addEventListener('click', clickOutside);
    }, 0);

    function clickOutside(ev) {
      if (!editor.contains(ev.target) && ev.target !== pillEl) {
        commit();
        document.removeEventListener('click', clickOutside);
      }
    }

    // assemble
    editor.append(nameInput, colorInput, colorText, saveBtn);
    pillEl.appendChild(editor);
    nameInput.focus();
  }

  // adiciona e remove tags
  function addTag(name, color) {
    if (!name || tags.some(t => t.name === name)) return;
    const tagObj = { name, color: color || randomColor() };
    tags.push(tagObj);
    tagsEl.appendChild(makePill(tagObj));
    syncHidden();
    if (actions.onAdd) actions.onAdd(tagObj.name);
  }
  function removeTag(name) {
    const idx = tags.findIndex(t => t.name === name);
    if (idx < 0) return;
    tags.splice(idx, 1);
    const pill = tagsEl.querySelectorAll('.tag-pill')[idx];
    if (pill) pill.remove();
    syncHidden();
    if (actions.onRemove) actions.onRemove(name);
  }

  // key handling (Enter ou vírgula)
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputEl.value.trim().replace(/,$/,'');
      if (val) addTag(val);
      inputEl.value = '';
    }
  });

  // inicializa com cores passadas ou random
  initialTags.forEach(item => {
    if (typeof item === 'string')      addTag(item);
    else if (item && item.name)        addTag(item.name, item.color);
  });

  /**
   * Substitui completamente as tags atuais pelas novas.
   * @param {Array<string|{name:string,color:string}>} newTags
   */
  fieldEl.updateTags = function(newTags) {
    // limpa estado e DOM
    tags.splice(0, tags.length);
    tagsEl.innerHTML = '';
    if (!newTags) return;
    // adiciona cada uma
    newTags.forEach(item => {
      if (typeof item === 'string') {
        addTag(item);
      } else if (item && item.name) {
        addTag(item.name, item.color);
      }
    });
    // e limpa o input de texto
    inputEl.value = '';
  };

  fieldEl.getTags = function() {
    // retornar cópia para não expor o array interno
    return tags.map(t => ({ name: t.name, color: t.color }));
  };

  return fieldEl;
}
