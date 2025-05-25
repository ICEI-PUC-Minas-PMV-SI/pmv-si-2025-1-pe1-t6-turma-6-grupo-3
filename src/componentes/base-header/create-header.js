
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

