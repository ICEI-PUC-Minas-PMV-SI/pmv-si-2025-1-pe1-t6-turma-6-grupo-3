function createHeader(document, wrapper, { 
    id, 
    breadcrumbs,
    title,
    icon,
    actions = {},
    settingsButtons = []
 }) {
    const tmpl = wrapper.querySelector('#header-template').content;
    const clone = document.importNode(tmpl, true);

    const headerEl = clone.firstElementChild;
    if (id) headerEl.id = id;
    // — Breadcrumb
    const ol = clone.querySelector('[data-sub-component="header::breadcrumb::ol"]')
    ol.innerHTML = "";
    if (breadcrumbs) {
      const total = breadcrumbs.length;
      const lis = breadcrumbs.map(({label, href}, i) => {
        const li = document.createElement('li');
        const isLast = total === i + 1;
        li.className = `breadcrumb-item ${isLast && "active"}`

        if (isLast) {
          li.innerText = label;
          return li;
        }
        const a = document.createElement('a');
        a.href = href;
        a.innerText = label;
        li.appendChild(a);

        return li;
      });
      lis.forEach(el => ol.appendChild(el))
    }
    
    // — Ícone
    if (icon) {
        clone.querySelector('[data-sub-component="header::icon"]').classList.add(`bi`);
        clone.querySelector('[data-sub-component="header::icon"]').classList.add(`bi-${icon}`);
    } else {
        clone.querySelector('[data-sub-component="header::icon"]').style.display = 'none';
    }

    // — Título
    const h3 = clone.querySelector('[data-sub-component="header::title"]');
    h3.innerText = title;

    // — Botão “Adicionar”
    const addBtn = clone.querySelector('[data-action="add"]');
    if (actions.add) {
      addBtn.addEventListener('click', actions.add);
    } else {
      addBtn.style.display = 'none';
    }

    // — Botão “Filter”
    const filterBtn = clone.querySelector('[data-action="filter"]');
    if (actions.filter) {
      filterBtn.addEventListener('click', actions.filter);
    } else {
      filterBtn.style.display = 'none';
    }


    // — Settings dropdown
    const settingsEl = clone.querySelector('[data-sub-component="header::settings"]');
    const toggleBtn = settingsEl.querySelector('button');
    const settingsMenu = clone.querySelector('[data-sub-component="header::settings::menu"]');
    settingsMenu.innerHTML = '';

    if (settingsButtons.length > 0) {
      settingsButtons.forEach(({ label, action, icon: btnIcon }) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dropdown-item';
        btn.innerHTML = [
        btnIcon ? `<i class="bi bi-${btnIcon} me-2"></i>` : '',
          label
        ].join('');
        btn.addEventListener('click', e => {
          e.preventDefault();
          action(e);
        });
        li.appendChild(btn);
        settingsMenu.appendChild(li);
      });
    } else {
      // não exibe o dropdown se não houver botões
      settingsEl.style.display = 'none';
    }

    // Toggle em puro JS
    toggleBtn.addEventListener('click', e => {
      e.stopPropagation();             // não dispara o listener de document abaixo
      settingsMenu.classList.toggle('show');   // .show faz display:block via Bootstrap CSS
    });

    // Fecha ao clicar fora
    document.addEventListener('click', e => {
      if (!settingsEl.contains(e.target)) {
        settingsMenu.classList.remove('show');
      }
    });

    return clone;
  }

/**
 * Atualiza um header já renderizado no DOM.
 *
 * @param {HTMLElement} headerEl — o elemento raiz do header (ex: .sub-header)
 * @param {Object} opts
 *   - breadcrumbs?: Array<{ label: string, href?: string }>
 *   - title?: string
 *   - icon?: string            // nome do bi-icon (sem 'bi-')
 *   - actions?: { add?: fn, filter?: fn }
 *   - settingsButtons?: Array<{
 *       label: string,
 *       action: Function,
 *       icon?: string
 *     }>
 */
function updateHeader(headerEl, {
  breadcrumbs,
  title,
  icon,
  actions = {},
  settingsButtons
}) {
  // HELPERS
  function replaceListener(selector, eventName, handler) {
    const old = headerEl.querySelector(selector);
    if (!old) return;
    const neo = old.cloneNode(true);
    old.parentNode.replaceChild(neo, old);
    if (handler) neo.addEventListener(eventName, handler);
    return neo;
  }

  // 1) Breadcrumbs
  if (Array.isArray(breadcrumbs)) {
    const ol = headerEl.querySelector('[data-sub-component="header::breadcrumb::ol"]');
    ol.innerHTML = '';
    breadcrumbs.forEach(({ label, href }, idx) => {
      const li = document.createElement('li');
      const isLast = idx === breadcrumbs.length - 1;
      li.className = `breadcrumb-item${isLast ? ' active' : ''}`;
      if (isLast) {
        li.textContent = label;
      } else {
        const a = document.createElement('a');
        a.href = href || '#';
        a.textContent = label;
        li.appendChild(a);
      }
      ol.appendChild(li);
    });
  }

  // 2) Título
  if (title !== undefined) {
    const h3 = headerEl.querySelector('[data-sub-component="header::title"]');
    h3.textContent = title;
  }

  // 3) Ícone ao lado do título
  if (icon !== undefined) {
    const iconEl = headerEl.querySelector('[data-sub-component="header::icon"]');
    if (icon) {
      iconEl.style.display = '';
      iconEl.className = `fs-3 text-primary me-2 bi bi-${icon}`;
    } else {
      iconEl.style.display = 'none';
    }
  }

  // 4) Botões Add / Filter
  // se vier handler, substitui listener; se não, esconde

  if (actions && actions.add) {
    replaceListener('[data-action="add"]', 'click', actions.add);
  }

  if (actions && actions.filter) {
    replaceListener('[data-action="filter"]', 'click', actions.filter);
  }

  // 5) Settings dropdown
  const settingsEl   = headerEl.querySelector('[data-sub-component="header::settings"]');
  const toggleBtn    = settingsEl && settingsEl.querySelector('button');
  const menu         = settingsEl && settingsEl.querySelector('[data-sub-component="header::settings::menu"]');

  if (settingsButtons && menu && toggleBtn) {
    // limpa menu
    menu.innerHTML = '';
    // popula
    settingsButtons.forEach(({ label, action, icon: btnIcon }) => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'dropdown-item';
      btn.innerHTML = btnIcon
        ? `<i class="bi bi-${btnIcon} me-2"></i>${label}`
        : label;
      btn.addEventListener('click', e => {
        e.preventDefault();
        action(e);
        menu.classList.remove('show');
      });
      li.appendChild(btn);
      menu.appendChild(li);
    });
    settingsEl.style.display = '';
  }
}