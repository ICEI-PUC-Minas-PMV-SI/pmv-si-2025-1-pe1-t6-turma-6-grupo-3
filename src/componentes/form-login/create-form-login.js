 function createLoginForm(document, wrapper, { withLogo, title, fields, buttons }) {
    console.log("wrapper form", wrapper);
    
    const tmpl = wrapper.querySelector('#login-form-template').content;
    const clone = document.importNode(tmpl, true);

    if (!withLogo) {
         clone.querySelector('[data-sub-component="form::header::logo"]').style.display = "none";
    }

    clone.querySelector('[data-sub-component="form::body::title"]').innerText = title;
    
    const fieldsSlot = clone.querySelector('[data-sub-component="form::body::fields-slot"]');
    fieldsSlot.innerHTML = "";
    fields.forEach(f => fieldsSlot.appendChild(f));

    const buttonsSlot = clone.querySelector('[data-sub-component="form::footer::buttons-slot"]');
    buttonsSlot.innerHTML = "";
    buttons.forEach(b => buttonsSlot.appendChild(b));

    return clone;
  }

function createLoginField(document, wrapper, { name, placeholder, type, actions }) {
  console.log("wrapper field", wrapper);
  const tmpl = wrapper.querySelector('#login-field-template');
  if (!tmpl) throw new Error('Template #login-field-template não encontrado');
  
  const fragment = document.importNode(tmpl.content, true);

  const input = fragment.querySelector('input[data-element-type="input"]');
  if (!input) throw new Error('Input não encontrado dentro do template');

  input.name = name;
  input.type = type;
  input.placeholder = placeholder;

  if (actions && typeof actions === 'object') {
    Object.entries(actions).forEach(([eventName, handler]) => {
      input.addEventListener(eventName, e => handler(e, input));
    });
  }

  return input;
}

function createLoginButton(document, wrapper, { name, isPrimary, isOutline, actions }) {
  console.log("wrapper button", wrapper);

    const tmpl = wrapper.querySelector('#login-button-template');
  if (!tmpl) throw new Error('Template #login-button-template não encontrado');
  
  const fragment = document.importNode(tmpl.content, true);

  const button = fragment.querySelector('button[data-element-type="button"]');
  if (!button) throw new Error('Button não encontrado dentro do template');

  button.innerText = name;

  if (isPrimary) {
    button.classList.add("btn-primary")
  }

  if (isOutline) {
    button.classList.add("custom-outline-btn")
  }

  if (actions && typeof actions === 'object') {
    Object.entries(actions).forEach(([eventName, handler]) => {
      button.addEventListener(eventName, e => handler(e, button));
    });
  }

  return button;
}
