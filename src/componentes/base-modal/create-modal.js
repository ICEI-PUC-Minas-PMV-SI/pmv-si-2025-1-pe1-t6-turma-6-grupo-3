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

  // associa handlers
  Object.entries(actions).forEach(([evt, handler]) => {
    inputEl.addEventListener(evt, e => handler(e, inputEl));
  });

  return fieldEl;
}

function createModalTextarea(document, wrapper, {
  name,
  label = '',
  placeholder = '',
  rows = 4,
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

  // 4. Associa event listeners
  Object.entries(actions).forEach(([evt, handler]) => {
    textareaEl.addEventListener(evt, e => handler(e, textareaEl));
  });

  return fieldEl;
}