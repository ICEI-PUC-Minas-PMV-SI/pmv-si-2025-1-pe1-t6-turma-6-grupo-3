function createImageSelector(document, wrapper, node) {
  const tmpl = wrapper.querySelector('#image-selector-template').content;
  const clone = document.importNode(tmpl, true);

  clone.firstElementChild.dataset.containerId = node.id;
  const remove = clone.querySelector('[data-action="remove"]');
  const save = clone.querySelector('[data-action="save"]');
  const clear =  clone.querySelector('[data-action="clear"]');
  const edit = clone.querySelector('[data-action="edit"]');
  const img = clone.querySelector('[data-sub-component-type="image-content"]');
  const input = clone.querySelector('[data-sub-component-type="image-src-input"]');
  
  img.children[1].src = node.value || "";
  const imgParent = img.parentNode;
  input.value = node.value || "";

  input.addEventListener("input", (e) => {
    console.log("VALUE FROM INPUT", e.target.value);
    img.children[1].src = e.target.value;
    // node.updateValue(e.target.value);
  })


  remove.addEventListener("click", () => {
    imgParent.removeChild(img);
    input.value = "";
    // node.updateValue("");

  })

  edit.addEventListener("click", () => {
    imgParent.removeChild(img);
  })

  save.addEventListener("click", () => {
    imgParent.appendChild(img);
  })

  clear.addEventListener("click", () => {
    input.value = "";
    // node.updateValue("");
  })
  if (!node.value) {
    imgParent.removeChild(img);
  }

  return clone;
}
