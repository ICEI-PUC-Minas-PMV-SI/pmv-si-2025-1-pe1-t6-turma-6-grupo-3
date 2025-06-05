/**
 * Função que cria e retorna o componente de busca.
 * @param {Document} document — objeto document
 * @param {Document|Element} wrapper — onde buscar o template
 * @param {Object} opts
 *   - onSelect: Function(item) — callback quando o usuário seleciona um resultado
 */
function createSearchInput(document, wrapper, { onSelect, search }) {
  // Clona o template
  const template = wrapper.querySelector("#search-input-template").content;
  const clone = document.importNode(template, true);

  // Referências aos sub-elementos
  const inputGroup = clone.querySelector('[data-sub-component-type="search::input"]');
  const inputEl = inputGroup.querySelector("input");
  const resultsList = clone.querySelector('[data-sub-component-type="search::result-list"]');

  let debounceTimer = null;

  // Função para limpar dropdown
  function clearDropdown() {
    resultsList.innerHTML = "";
    resultsList.style.display = "none";
  }

  // Renderiza itens no dropdown
  function renderDropdown(items) {
    resultsList.innerHTML = "";

    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = "Nenhum resultado encontrado.";
      resultsList.appendChild(li);
    } else {
      items.forEach(item => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";
        const text = item.label
          ? `${item.label}`
          : `${item.type} – ${item.localization.notebook_id ??
              item.localization.notebookId}`;
        li.textContent = text;
        const badge = document.createElement("span");
        badge.className = "badge bg-primary rounded-pill";
        badge.textContent = item.type;
        li.appendChild(badge);

        // Ao clicar em um resultado, chama onSelect e limpa dropdown
        li.addEventListener("click", () => {
          clearDropdown();
          inputEl.value = item.label || "";
          if (typeof onSelect === "function") {
            onSelect(item);
          }
        });

        resultsList.appendChild(li);
      });
    }
    resultsList.style.display = "block";
  }

  // Listener no input com debounce de 3 segundos
  inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = inputEl.value.trim();
      if (term === "") {
        clearDropdown();
        return;
      }
      const results = search(term);
      renderDropdown(results);
    }, 600);
  });

  // Clicar fora do componente fecha dropdown
  document.addEventListener("click", e => {
    if (
      !inputEl.contains(e.target) &&
      !resultsList.contains(e.target)
    ) {
      clearDropdown();
    }
  });

  return clone;
}