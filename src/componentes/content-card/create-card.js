// Função de clonagem igual à usada na página real    
function createContentCard(document, wrapper, { data, actions }) {
    const t = wrapper.querySelector('#card-template').content;
    const clone = document.importNode(t, true);
    clone.firstElementChild.dataset.cardId = `content-card-${data.id}`;
    if (actions) {
        clone.querySelector('[data-action="view"]').addEventListener("click", actions.view)
        clone.querySelector('[data-action="edit"]').addEventListener("click", actions.edit)
        clone.querySelector('[data-action="remove"]').addEventListener("click", actions.remove)
    }

    clone.querySelector('.card-title').textContent = data.name;

    const tagsContainer = clone.querySelector('.tags-container');
    tagsContainer.innerHTML = '';  // limpa o template
    console.log("data.tags::", data.tags);
    data.tags.split(", ").forEach(tag => {
      console.log("tag: ",  tag)
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = tag;
        span.title       = tag;
        // TODO: put it back when tag got color
        // span.style.backgroundColor = tag.color;
  //       span.style.color = getContrastWCAG(tag.color.replace(/^rgb\(|\)|\s+/g, c =>
  //   ('0'+parseInt(c).toString(16)).slice(-2)
  // )) || getContrastWCAG(tag.color.replace(/^#/,''));
        tagsContainer.appendChild(span);
    });


    clone.querySelector('.content-icon i').className = `bi bi-${data.icon}`;
    return clone;
}
/**
 * Given any CSS color in hex, returns a contrasting color that
 * meets WCAG “AA” contrast (black or white).
 */
function getContrastWCAG(hex) {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);

  // relative luminance
  const L = 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b);

  // per WCAG: choose black if bg is light, white if bg is dark
  return L > 0.179 ? '#000000' : '#ffffff';
}

/**
 * Convert sRGB channel to linear value
 */
function toLinear(c) {
  c = c/255;
  return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
}

/*
* @param {Object} opts
 *   - id:       string                 — o mesmo data.id usado na criação
 *   - name?:    string                 — novo título
 *   - tags?:    string | string[]      — string separada por “, ” ou array de strings
 *   - icon?:    string                 — nome do Bootstrap Icon (sem “bi-”)
 *   - actions?: { view?: fn, edit?: fn } — novos handlers
 */
function updateContentCard(document, {
  data: {
    id,
    name,
    tags,
    icon,
  },
  actions = {}
}) {
  // 1) encontra o card existente `notebook-card-${data.id}`;
  const card = document.querySelector(`[data-card-id="content-card-${id}"]`);
  if (!card) {
    console.warn(`ContentCard com data-card-id="${id}" não encontrado.`);
    return;
  }

  // 2) atualiza o título
  if (name !== undefined) {
    const titleEl = card.querySelector('.card-title');
    if (titleEl) titleEl.textContent = name;
  }

  // 3) atualiza as tags
  if (tags !== undefined) {
    const container = card.querySelector('.tags-container');
    if (container) {
      container.innerHTML = '';
      // normaliza em array
      const list = Array.isArray(tags)
        ? tags
        : String(tags).split(/\s*,\s*/).filter(Boolean);
      list.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = tag;
        span.title       = tag;
        container.appendChild(span);
      });
    }
  }

  // 4) atualiza o ícone de conteúdo
  if (icon !== undefined) {
    const iconEl = card.querySelector('.content-icon i');
    if (iconEl) iconEl.className = `bi bi-${icon}`;
  }

  // 5) substitui event listeners, se vierem novos handlers
  function replaceListener(selector, eventName, handler) {
    const btn = card.querySelector(selector);
    if (!btn) return;
    const novo = btn.cloneNode(true);
    btn.parentNode.replaceChild(novo, btn);
    if (handler) novo.addEventListener(eventName, handler);
  }

  if (actions.view !== undefined) {
    replaceListener('[data-action="view"]', 'click', actions.view);
  }
  if (actions.edit !== undefined) {
    replaceListener('[data-action="edit"]', 'click', actions.edit);
  }
}