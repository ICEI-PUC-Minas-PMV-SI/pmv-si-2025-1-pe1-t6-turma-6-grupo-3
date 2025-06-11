function createContainer(document, wrapper, { id, items = [] }) {
  const tmpl = wrapper.querySelector('#container-template').content;
  const clone = document.importNode(tmpl, true);

  clone.firstElementChild.dataset.containerId = id;
  const slot = clone.querySelector('[data-slot="items-slot"]');
  items.forEach(el => slot.appendChild(el));

  return clone;
} 

function appendToContainerSlot(document, id, item) {
  const containerEl = document.querySelector(`[data-container-id="${id}"]`);
  console.log("container", containerEl);
  containerEl.appendChild(item);
}

function resetContainer(document, id, items=[]){
  const containerEl = document.querySelector(`[data-container-id="${id}"]`);
  containerEl.innerHTML = "";

  items.forEach(el => containerEl.appendChild(el));

}