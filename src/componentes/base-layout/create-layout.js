 function createLayout(document, wrapper, { content }) {
    const tmpl = wrapper.querySelector('#base-layout').content;
    const clone = document.importNode(tmpl, true);

    const contentSlot = clone.querySelector('[data-slot="content"]');
    contentSlot.appendChild(content)

    return clone;
  }