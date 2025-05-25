 function createLayout(document, wrapper, { content, user: { name, logout } }) {
    const tmpl = wrapper.querySelector('#base-layout').content;
    const clone = document.importNode(tmpl, true);

    const username = clone.querySelector('[data-sub-component="layout::top-bar::username"]');
    username.innerText = name;
    
    const logoutBtn = clone.querySelector('[data-sub-component="layout::sidebar::logout"]');
    logoutBtn.addEventListener("click",  logout);
    
    const contentSlot = clone.querySelector('[data-slot="content"]');
    contentSlot.appendChild(content)

    return clone;
  }