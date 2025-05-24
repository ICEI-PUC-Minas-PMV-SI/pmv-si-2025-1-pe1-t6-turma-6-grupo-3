document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const loginBtn = document.getElementById("loginBtn");
  const registerConfirm = document.getElementById("registerConfirm");

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  loginBtn.addEventListener("click", function () {
    const email = emailInput.value.trim();
    console.log("Tentando login com:", email);

    if (!validarEmail(email)) {
      alert("Digite um e-mail válido.");
      return;
    }

    if (passwordInput.classList.contains("d-none")) {
      passwordInput.classList.remove("d-none");
      passwordInput.focus();
      return;
    }

    const senha = passwordInput.value.trim();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Usuários armazenados:", users);

    const encontrado = users.find(
      (user) => user.email === email && user.senha === senha
    );

    if (encontrado) {
      alert("Login bem-sucedido!");
      window.location.href = "home_login.html";
    } else {
      alert("Usuário ou senha incorretos.");
    }
  });

  registerConfirm.addEventListener("click", function () {
    const email = document.getElementById("newEmail").value.trim();
    const senha = document.getElementById("newPassword").value.trim();

    console.log("Tentando cadastro com:", email);

    if (!validarEmail(email)) {
      alert("Digite um e-mail válido.");
      return;
    }

    if (senha.length < 4) {
      alert("A senha deve ter ao menos 4 caracteres.");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((user) => user.email === email)) {
      alert("Usuário já cadastrado.");
      return;
    }

    users.push({ email, senha });
    localStorage.setItem("users", JSON.stringify(users));
    console.log("Usuários atualizados:", users);

    alert("Cadastro realizado com sucesso!");
    document.getElementById("newEmail").value = "";
    document.getElementById("newPassword").value = "";

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("cadastroModal")
    );
    modal.hide();
  });
});
