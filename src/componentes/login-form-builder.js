function LoginFormBuilder(document, basePath) {
   return Promise.all([
            fetch(basePath+'/componentes/login-form/form.html').then(res => res.text()),
        ]).then(([html]) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;

        return [wrapper]
      }).then(([wrapper]) => {
        const localCreator = {
          [createLoginForm.name]: (args) => createLoginForm(document, wrapper, args),
          [createLoginField.name]: (args) => createLoginField(document, wrapper, args),
          [createLoginButton.name]: (args) => createLoginButton(document, wrapper, args),
        }
        return localCreator;
      })
}