// 1. Cria e retorna o elemento do modal, já com todos os listeners
function createModal(document, wrapper, {
  id,
  title,
  bodyElements = [],
  footerButtons = [],
  closeOnBackdrop = true,
  closeOnEsc = true
}) {
  const tmpl = wrapper.querySelector('#modal-template').content;
  const fragment = document.importNode(tmpl, true);

  const overlay = fragment.querySelector('[data-element-type="overlay"]');
  overlay.id = id;

  // título
  fragment.querySelector('[data-element-type="title"]').innerText = title;

  // corpo
  const bodySlot = fragment.querySelector('[data-element-type="body"]');
  bodySlot.innerHTML = '';
  bodyElements.forEach(el => bodySlot.appendChild(el));

  // footer
  const footerSlot = fragment.querySelector('[data-element-type="footer"]');
  footerSlot.innerHTML = '';
  footerButtons.forEach(btn => footerSlot.appendChild(btn));

  // fechar pelo botão “×”
  fragment
    .querySelector('[data-element-type="close-button"]')
    .addEventListener('click', () => hideModal(overlay));

  // fechar ao clicar fora da caixa
  if (closeOnBackdrop) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) hideModal(overlay);
    });
  }

  // fechar com Esc
  if (closeOnEsc) {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        hideModal(overlay);
      }
    });
  }

  
  // começa escondido
  overlay.classList.add('hidden');
  return overlay;
}

// 2. Cria botões para o footer do modal
function createModalButton(document, wrapper, {
  text,
  isPrimary = false,
  isOutline = false,
  actions = {}
}) {
  const tmpl = wrapper.querySelector('#modal-button-template');
  const fragment = document.importNode(tmpl.content, true);
  const button = fragment.querySelector('[data-element-type="modal-button"]');

  button.innerText = text;
  if (isPrimary) button.classList.add('btn-primary');
  if (isOutline) button.classList.add('btn-outline-primary');

  Object.entries(actions).forEach(([eventName, handler]) => {
    button.addEventListener(eventName, e => handler(e, button));
  });

  return button;
}

// 3. Mostra o modal
function showModal(modalEl) {
  modalEl.classList.remove('hidden');
}

// 4. Esconde o modal
function hideModal(modalEl) {
  modalEl.classList.add('hidden');
}

function createModalField(document, wrapper, {
  name,
  type = 'text',
  label = '',
  placeholder = '',
  customClass = [],
  actions = {}
}) {
  const tmpl = wrapper.querySelector('#modal-field-template').content;
  const fragment = document.importNode(tmpl, true);

  const fieldEl = fragment.querySelector('[data-element-type="field"]');
  const labelEl = fieldEl.querySelector('[data-element-type="label"]');
  const inputEl = fieldEl.querySelector('[data-element-type="input"]');

  labelEl.innerText = label;
  inputEl.name = name;
  inputEl.placeholder = placeholder;
  inputEl.type = type;

  // associa handlers
  Object.entries(actions).forEach(([evt, handler]) => {
    inputEl.addEventListener(evt, e => handler(e, inputEl));
  });

  customClass.forEach(c => fieldEl.classList.add(c));
  return fieldEl;
}

function createModalTextarea(document, wrapper, {
  name,
  label = '',
  placeholder = '',
  rows = 4,
  customClass=[],
  actions = {}
}) {
  // 1. Pega o template
  const tmpl = wrapper.querySelector('#modal-textarea-template').content;
  const fragment = document.importNode(tmpl, true);

  // 2. Seleciona elementos
  const fieldEl    = fragment.querySelector('[data-element-type="textarea-field"]');
  const labelEl    = fieldEl.querySelector('[data-element-type="label"]');
  const textareaEl = fieldEl.querySelector('[data-element-type="textarea"]');

  // 3. Ajusta atributos
  labelEl.innerText         = label;
  textareaEl.name           = name;
  textareaEl.placeholder    = placeholder;
  textareaEl.rows           = rows;

  customClass.forEach(c => fieldEl.classList.add(c));

  // 4. Associa event listeners
  Object.entries(actions).forEach(([evt, handler]) => {
    textareaEl.addEventListener(evt, e => handler(e, textareaEl));
  });

  return fieldEl;
}

function updateModal(modalEl, {
  title,
  footerButtons,
  closeOnBackdrop,
  closeOnEsc,
  fieldValues
}) {
  // 1) Atualiza título
  if (title !== undefined) {
    modalEl.querySelector('[data-element-type="title"]').innerText = title;
  }

  // 2) Atualiza footer (se necessário)
  if (Array.isArray(footerButtons)) {
    const footerSlot = modalEl.querySelector('[data-element-type="footer"]');
    footerSlot.innerHTML = '';
    footerButtons.forEach(btn => footerSlot.appendChild(btn));
  }

  // 3) Injeta valores nos campos
  if (fieldValues && typeof fieldValues === 'object') {
    Object.entries(fieldValues).forEach(([name, value]) => {
      // encontra input ou textarea com esse name
      const field = modalEl.querySelector(`[name="${name}"]`);
      if (!field) return;

      // tenta achar o wrapper do componente
      // (se você tiver usado data-element-type no wrapper, pode filtrar por ele)
      const wrapper = field.closest('[data-element-type="icon-selector"], [data-element-type="tag-selector"]');
      console.log("wrapper::", wrapper)
      // se for um Icon Selector
      if (wrapper?.updateValue) {
        wrapper.updateValue(value);
      }
      // se for um Tag Input
      else if (wrapper?.updateTags) {
        wrapper.updateTags(value);
      }
      // caso contrário, input/textarea comum
      else {
        field.value = value;
      }
    });
  }

  // 4) Configura fechar por backdrop
  if (closeOnBackdrop !== undefined) {
    if (modalEl._backdropHandler) {
      modalEl.removeEventListener('click', modalEl._backdropHandler);
      delete modalEl._backdropHandler;
    }
    if (closeOnBackdrop) {
      const handler = e => {
        if (e.target === modalEl) hideModal(modalEl);
      };
      modalEl._backdropHandler = handler;
      modalEl.addEventListener('click', handler);
    }
  }

  // 5) Configura fechar com Esc
  if (closeOnEsc !== undefined) {
    if (modalEl._escHandler) {
      document.removeEventListener('keydown', modalEl._escHandler);
      delete modalEl._escHandler;
    }
    if (closeOnEsc) {
      const handler = e => {
        if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
          hideModal(modalEl);
        }
      };
      modalEl._escHandler = handler;
      document.addEventListener('keydown', handler);
    }
  }
}


// 2. Cria botões para o footer do modal
function createModalSubmitButton(document, wrapper, {
  text,
  isPrimary = false,
  isOutline = false,
  actions = {}
}) {
  const tmpl = wrapper.querySelector('#modal-submit-button-template');
  const fragment = document.importNode(tmpl.content, true);
  const button = fragment.querySelector('[data-element-type="modal-button"]');

  button.innerText = text;
  if (isPrimary) button.classList.add('btn-primary');
  if (isOutline) button.classList.add('btn-outline-primary');

  Object.entries(actions).forEach(([eventName, handler]) => {
    button.addEventListener(eventName, e => { 
      e.preventDefault();
      handler(e, button)
    });
  });

  return button;
}
