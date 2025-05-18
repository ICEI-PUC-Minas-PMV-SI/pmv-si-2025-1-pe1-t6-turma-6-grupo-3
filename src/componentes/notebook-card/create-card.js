// Função de clonagem igual à usada na página real    
function createNotebookCard(document, wrapper, data) {
    const t = wrapper.querySelector('#card-template').content;
    const clone = document.importNode(t, true);
    clone.querySelector('.card-title').textContent = data.name;
    const img = clone.querySelector('img.card-img-top');
    img.src = data.image; img.alt = data.name;
    clone.querySelector('.icon-notebook i').className = data.icon;
    return clone;
}