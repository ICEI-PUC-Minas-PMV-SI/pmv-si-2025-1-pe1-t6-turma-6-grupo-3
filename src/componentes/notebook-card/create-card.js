// Função de clonagem igual à usada na página real    
function createNotebookCard(document, wrapper, {data, actions }) {
    const t = wrapper.querySelector('#card-template').content;
    const clone = document.importNode(t, true);
    clone.firstElementChild.dataset.cardId = data.id;

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

/**
 * Atualiza um notebook-card já renderizado no DOM.
 *
 * @param {Document} document — objeto document
 * @param {Object} opts
 *   - id:       string — identifica qual card atualizar (data-id)
 *   - name:     string — novo title
 *   - image?:   string — url da imagem (se omitido, gera placeholder)
 *   - icon?:    string — nome do ícone bi (ex: "book")
 *   - actions?: { view?: Function, edit?: Function } — novos handlers
 */
function updateNotebookCard(document, {
  data: {
    id,
    name,
    image,
    icon
  },
  actions = {}
}) {
  // 1) encontra o card existente
  const card = document.querySelector(`[data-card-id="${id}"]`);
  if (!card) {
    console.warn(`Card com data-id="${id}" não encontrado.`);
    return;
  }

  // 2) atualiza o título
  const titleEl = card.querySelector('.card-title');
  if (titleEl) titleEl.textContent = name;

  // 3) atualiza a imagem e alt
  const img = card.querySelector('img.card-img-top');
  if (img) {
    if (image) {
      img.src = image;
    } else {
      // mesma lógica de placeholder do createNotebookCard
      img.src = `https://placehold.co/600x400/orange/white?text=${
        name.split(" ")
          .map(w => w.length > 2 ? w.slice(0,4) : `${w[0]}.`)
          .join("+")
      }&font=roboto`;
    }
    img.alt = name;
  }

  // 4) atualiza o ícone
  if (icon) {
    const iconEl = card.querySelector('.icon-notebook i');
    if (iconEl) iconEl.className = `bi bi-${icon}`;
  }

  // 5) substitui event listeners, se vierem novos handlers
  function replaceListener(selector, eventName, handler) {
    const btn = card.querySelector(selector);
    if (!btn) return;
    // clona sem listeners
    const novo = btn.cloneNode(true);
    btn.parentNode.replaceChild(novo, btn);
    novo.addEventListener(eventName, handler);
  }

  if (actions.view) {
    replaceListener('[data-action="view"]', 'click', actions.view);
  }
  if (actions.edit) {
    replaceListener('[data-action="edit"]', 'click', actions.edit);
  }
}


function removeGenericCard(document, id) {
  const card = document.querySelector(`[data-card-id="${id}"]`);
  if (!card) {
    console.warn(`removeCard: nenhum card encontrado com data-card-id="${id}"`);
    return;
  }
  card.remove();
}