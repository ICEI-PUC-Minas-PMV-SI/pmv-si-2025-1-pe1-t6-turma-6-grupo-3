// Função de clonagem igual à usada na página real    
function createNotebookCard(document, wrapper, {data, actions }) {
    const t = wrapper.querySelector('#card-template').content;
    const clone = document.importNode(t, true);

    if (actions){
        clone.querySelector('[data-action="view"]').addEventListener("click", actions.view);
        clone.querySelector('[data-action="edit"]').addEventListener("click", actions.edit);
    }

    clone.querySelector('.card-title').textContent = data.name;
    const img = clone.querySelector('img.card-img-top');
    if (data.image) { 
        img.src = data.image; 
    } else {
        img.src = `https://placehold.co/600x400/orange/white?text=${
            data.name.split(" ")
                .map(w =>  w.length > 2 ?  `${w.slice(0, 4)}` : `${w[0]}.` ).join("+")
        }e&font=roboto`
    }

    img.alt = data.name;
    clone.querySelector('.icon-notebook i').className = `bi bi-${data.icon}`;
    return clone;
}