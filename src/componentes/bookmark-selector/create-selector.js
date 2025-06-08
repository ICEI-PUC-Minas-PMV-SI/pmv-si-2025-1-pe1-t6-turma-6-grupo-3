// ------------------------------------------------------------
// 2) Função que cria o “Internal Bookmark Selector”
// ------------------------------------------------------------
/**
 * createInternalBookmarkSelector:
 * - Clona o template de busca interna
 * - Gera debounce na busca (300ms)
 * - Exibe resultados em <ul>
 * - Ao clicar em um <li>, mostra o painel de detalhes dependendo do tipo:
 *   • notebook → ícone, título, descrição, thumbnail (se houver)
 *   • content  → ícone, título, tags
 *   • node
 *       – se for do mesmo notebook_id/content_id atuais → “Ir para nó” (go‐to)
 *       – se for de outro doc → ícone genérico, valor e destaque (type)
 *
 * @param {Document} document
 * @param {Element|Document} wrapper
 * @param {Object} opts
 *   - currentNotebookId  (string) notebook corrente
 *   - currentContentId   (string) conteúdo corrente
 *   - onGoToNode(nodeId) callback para “ir para nó atual”
 */
function createInternalBookmarkSelector(
  document,
  wrapper,
  { 
    currentNotebookId, 
    currentContentId, 
    selected,
    onGoToNode, 
    getNotebook, 
    getContentMeta, 
    getContentNode,
    onSelect = console.log,
    search,
  }
) {
  console.log("CREATE BOOKMARK ARG", {
    currentNotebookId, 
    currentContentId, 
    selected,
    onGoToNode, 
    getNotebook, 
    getContentMeta, 
    getContentNode,
    search,
  })
  const current = {};
  // 2.1) Clona o template
  const tmpl = wrapper.querySelector(
    "#internal-bookmark-selector-template"
  ).content;
  const clone = document.importNode(tmpl, true);

  // 2.2) Referências

  const valueEl = clone.querySelector(
    '[data-sub-component-type="selector::value-holder"]'
  );
  
  const inputEl = clone.querySelector(
    '[data-sub-component-type="internal-search-input"]'
  );
  const resultsList = clone.querySelector(
    '[data-sub-component-type="internal-search-results"]'
  );
  const displaySection = clone.querySelector(
    '[data-sub-component-type="internal-bookmark-display"]'
  );

  // Notebook display refs
  const notebookBlock = displaySection.querySelector(
    '[data-sub-component-type="display-notebook"]'
  );
  const notebookIconEl = notebookBlock.querySelector(
    '[data-sub-component-type="notebook-icon"]'
  );
  const notebookTitleEl = notebookBlock.querySelector(
    '[data-sub-component-type="notebook-title"]'
  );
  const notebookDescEl = notebookBlock.querySelector(
    '[data-sub-component-type="notebook-description"]'
  );
  const notebookImageEl = notebookBlock.querySelector(
    '[data-sub-component-type="notebook-image"]'
  );

  // Content display refs
  const contentBlock = displaySection.querySelector(
    '[data-sub-component-type="display-content"]'
  );
  const contentIconEl = contentBlock.querySelector(
    '[data-sub-component-type="content-icon"]'
  );
  const contentTitleEl = contentBlock.querySelector(
    '[data-sub-component-type="content-title"]'
  );
  const contentTagsEl = contentBlock.querySelector(
    '[data-sub-component-type="content-tags"]'
  );

  // Node foreign display refs
  const nodeForeignBlock = displaySection.querySelector(
    '[data-sub-component-type="display-node-foreign"]'
  );
  const nodeForeignContentIconEl = nodeForeignBlock.querySelector(
    '[data-sub-component-type="node-foreign-content-icon"]'
  );
  const nodeForeignTitleEl = nodeForeignBlock.querySelector(
    '[data-sub-component-type="node-foreign-content-title"]'
  );
   const nodeForeignTagsEl = nodeForeignBlock.querySelector(
    '[data-sub-component-type="node-foreign-content-tags"]'
  );
  const nodeForeignTypeEl = nodeForeignBlock.querySelector(
    '[data-sub-component-type="node-foreign-type"]'
  );
  const nodeForeignPositionEl = nodeForeignBlock.querySelector(
    '[data-sub-component-type="node-foreign-position"]'
  );
  const nodeForeignValueEl = nodeForeignBlock.querySelector(
    '[data-sub-component-type="node-foreign-value"]'
  );


  // Node current display refs
  const nodeCurrentBlock = displaySection.querySelector(
    '[data-sub-component-type="display-node-current"]'
  );
  const nodeCurrentValueEl = nodeCurrentBlock.querySelector(
    '[data-sub-component-type="node-current-value"]'
  );
  const nodeCurrentTypeEl = nodeCurrentBlock.querySelector(
    '[data-sub-component-type="node-current-type"]'
  );
  const nodeCurrentPositionEl = nodeCurrentBlock.querySelector(
    '[data-sub-component-type="node-current-position"]'
  );

  let debounceTimer = null;

  const remove = clone.querySelector('[data-action="remove"]');
  const edit = clone.querySelector('[data-action="edit"]');

  // displaySection
  const displayParent = displaySection.parentNode;
  remove.addEventListener("click", () => {
    displayParent.removeChild(displaySection);
    clearResults();
    inputEl.value = "";
  })

  edit.addEventListener("click", () => {
    displayParent.removeChild(displaySection);
  })

  // 2.3) Função para esconder tudo no display
  function hideAllDisplays() {
    notebookBlock.classList.add("d-none");
    contentBlock.classList.add("d-none");
    nodeForeignBlock.classList.add("d-none");
    nodeCurrentBlock.classList.add("d-none");
    console.log("notebookBlock", notebookBlock)
    console.log("contentBlock", contentBlock)
    console.log("nodeForeignBlock", nodeForeignBlock)
    console.log("nodeCurrentBlock", nodeCurrentBlock)
  }
  function appendTags(el, tags) {
    el.innerHTML = "";
    if (Array.isArray(tags)) {
      tags.forEach((t) => {
        el.appendChild(buildTagBadge(t));
      });
    }
  }
  function buildTagBadge(tag) {
    const span = document.createElement("span");
    span.textContent = tag.name;
    span.style.backgroundColor = tag.color;
    span.className = "badge me-1";
    return span
  }
  // 2.4) Função que mostra detalhes conforme tipo
  function showDetails(item) {
    console.log("ITEM: ", item)
    current.value = item;
    displaySection.classList.remove("d-none");
    hideAllDisplays();

    if (item.type === "notebook") {
      const notebook = getNotebook(item.localization.notebook_id);
      notebookIconEl.className = `bi bi-${notebook.icon}`;
      notebookTitleEl.textContent = notebook.name;
      notebookDescEl.textContent = notebook.description || "";
      if (notebook.image) {
        notebookImageEl.src = notebook.image;
        notebookImageEl.style.display = "block";
      } else {
        notebookImageEl.style.display = "none";
      }
      notebookBlock.classList.remove("d-none");
   
    } else if (item.type === "content") {
      const meta = getContentMeta(
        item.localization.notebook_id, 
        item.localization.content_id,
      )
      contentIconEl.className = `bi bi-${meta.icon}`;
      contentTitleEl.textContent = meta.name;
      contentTagsEl.innerHTML = "";
      appendTags(contentTagsEl, meta.tags);
    contentBlock.classList.remove("d-none");
    } else if (item.type === "node") {
      const {
        notebook_id,
        content_id,
        node_id,
      } = item.localization;
      const node = getContentNode(notebook_id, content_id, node_id)
      const isCurrent =
        notebook_id === currentNotebookId &&
        content_id === currentContentId;
      if (isCurrent) {
        nodeCurrentValueEl.textContent = node.value;
        nodeCurrentPositionEl.textContent = node.position;
        nodeCurrentTypeEl.textContent = node.type;
        nodeCurrentBlock.classList.remove("d-none");
      } else {
        const meta = getContentMeta(node.notebook_id, node.content_id);
        nodeForeignContentIconEl.className = `bi bi-${meta.icon}`; // ícone genérico
        nodeForeignTitleEl.textContent = meta.name;
        appendTags(nodeForeignTagsEl, meta.tags);
        
        nodeForeignValueEl.textContent = node.value;
        nodeForeignTypeEl.textContent = node.type;
        nodeForeignPositionEl.textContent = node.position;
        nodeForeignBlock.classList.remove("d-none");
      }
    }
    displayParent.appendChild(displaySection);
  }

  // 2.5) Função para limpar dropdown
  function clearResults() {
    resultsList.innerHTML = "";
    resultsList.style.display = "none";
  }

  // 2.6) Renderiza lista de resultados
  function renderResults(items) {
    resultsList.innerHTML = "";
    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = "Nenhum resultado encontrado.";
      resultsList.appendChild(li);
    } else {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";
        // Texto principal: nome ou value
        const text =  item.label || item.name || item.value || item.id ;
        li.textContent = text;

        // Badge indicando tipo
        const badge = document.createElement("span");
        badge.className = "badge bg-primary rounded-pill";
        badge.textContent = item.type;
        li.appendChild(badge);

        // Ao clicar, exibe detalhes
        li.addEventListener("click", () => {
          valueEl.value = JSON.stringify(item);
          showDetails(item);
          onSelect(item);
        });
        resultsList.appendChild(li);
      });
    }
    resultsList.style.display = "block";
  }

  // 2.7) Listener do input com debounce
  inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = inputEl.value.trim();
      if (!term) {
        clearResults();
        displaySection.classList.add("d-none");
        return;
      }
      const results = search(term);
      console.log("==================")
      console.log(results)
      console.log("==================")
      renderResults(results);
      displaySection.classList.add("d-none");
    }, 300);
  });

  if (selected) {
    showDetails(selected)
  } else {
    hideAllDisplays();
    displayParent.removeChild(displaySection);
  }

  clone.getValue = () => current.value;

  return clone;
}