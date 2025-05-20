
 function createHeader(document, wrapper, { breadcrumbs, title, icon, actions }) {
    const tmpl = wrapper.querySelector('#header-template').content;
    const clone = document.importNode(tmpl, true);
    const ol = clone.querySelector('[data-sub-component="header::breadcrumb::ol"]')
    ol.innerHTML = "";

    if (icon) {
        clone.querySelector('[data-sub-component="header::icon"]').classList.add(`bi`);
        clone.querySelector('[data-sub-component="header::icon"]').classList.add(`bi-${icon}`);
    } else {
        clone.querySelector('[data-sub-component="header::icon"]').style.display = 'none';
    }
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

    if (actions && actions.add) {
        clone.querySelector('[data-action="add"]').addEventListener("click", actions.add)
    } else {
        clone.querySelector('[data-action="add"]').style.display = 'none';
    }

     if (actions && actions.filter) {
        clone.querySelector('[data-action="filter"]').addEventListener("click", actions.filter)
    } else {
        clone.querySelector('[data-action="filter"]').style.display = 'none';
    }

    const h3 = clone.querySelector('[data-sub-component="header::title"]');
    h3.innerText = title;
    return clone;
  }