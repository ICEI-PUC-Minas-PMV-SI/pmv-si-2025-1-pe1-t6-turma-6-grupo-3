 function createLayout(document, wrapper, { content, user: { name, logout }, searchInput }) {
    const tmpl = wrapper.querySelector('#base-layout').content;
    const clone = document.importNode(tmpl, true);

    const username = clone.querySelector('[data-sub-component="layout::top-bar::username"]');
    username.innerText = name;
    
    const logoutBtn = clone.querySelector('[data-sub-component="layout::sidebar::logout"]');
    logoutBtn.addEventListener("click",  logout);

    if (searchInput){
      const searchSlot = clone.querySelector('[data-sub-component="header::sidebar::search"]');
      searchSlot.appendChild(searchInput);
    }
    const contentSlot = clone.querySelector('[data-slot="content"]');
    contentSlot.appendChild(content)

    return clone;
  }