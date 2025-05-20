 function createContainer(document, wrapper, { items = [] }) {
    const tmpl = wrapper.querySelector('#container-template').content;
    const clone = document.importNode(tmpl, true);

    const slot = clone.querySelector('[data-slot="items-slot"]');
    items.forEach(el => slot.appendChild(el));

    return clone;
  }