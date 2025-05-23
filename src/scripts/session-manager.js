class SessionManager {
    constructor(userClient, storageManager) {
      this.userClient     = userClient;
      this.storage        = storageManager;
      this._changeCallbacks = [];
      this._deleteCallbacks = [];
      this.storage.load();

      // Inicializa sessão
      const savedId = localStorage.getItem(CURRENT_USER_KEY);
      const valid = savedId && this.userClient.findItem(savedId);

      this.currentUser = valid ? this.userClient.findItem(savedId) : null;
      this.originalUser = this.currentUser; // para suportar revert
      this._emitChange();
    }

    signup({ name, fullName, email, password, passwordVerification }) {
      const errors = this._validateSignup({ name, fullName, email, password, passwordVerification });
      if (errors && errors.length == 1) {
        return errors[0];
      }

      if (errors && errors.length > 1) {
        return new Error(`Multiplos erros encontrados: \n ${errors.map(e => `${e.message}\n`)}`)
      }

      if (password != passwordVerification) return new Error("as senhas não são iguais, vefique.");

      const user = this.userClient.insertItem({ name, fullName, email, password, role: "user" });

      this.storage.save();
      
      this._setCurrentUser(user);
    }

    _isValidEmail(email) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      return emailRegex.test(email)
    }

    _validateSignin({email, password}) {
      const errors = [];
      if (!email) {
        errors.push(new Error("Email não pode ser vazio"))
      }
      
      if (email && !this._isValidEmail(email)) {
        errors.push(new Error("Email inválido"))
      }

      if (!password) {
        errors.push(new Error("Senha não pode ser vazio"))
      }

      if (errors.length > 0) {
        return errors;
      }

      return
    }

    _validateSignup({email, password, passwordVerification, fullName, name}) {
      const errors = [];
      if (!email) {
        errors.push(new Error("Email não pode ser vazio"))
      }

      if (!name) {
        errors.push(new Error("Nome não pode ser vazio"))
      }

      if (!fullName) {
        errors.push(new Error("Nome Completo não pode ser vazio"))
      }
      
      if (email && !this._isValidEmail(email)) {
        errors.push(new Error("Email inválido"))
      }

      if (!password) {
        errors.push(new Error("Senha não pode ser vazio"))
      }

      if (!passwordVerification) {
        errors.push(new Error("Confimação Senha não pode ser vazio"))
      }

      if (errors.length > 0) {
        return errors;
      }

      return
    }

    signin({email, password}) {
      const errors = this._validateSignin({email, password});
      if (errors && errors.length == 1) {
        return errors[0];
      }

      if (errors && errors.length > 1) {
        return new Error(`Multiplos erros encontrados: \n ${errors.map(e => `${e.message}\n`)}`)
      }

      const [user, err] = this.userClient.findItemByEmail(email);

      if (err || user.password != password) {
        console.error("userClient.findItemByEmail: ", err);
        return new Error("Email e/ou Senha não encontrados.");
      }
      this._setCurrentUser(user);
      if (user.role == "admin") {
        this.originalUser = user;
      }
    }

    signout() {
      this.currentUser = null;
      this.originalUser = null;
      this.storage.save();

      localStorage.removeItem(CURRENT_USER_KEY);
      this._emitChange();
    }

    impersonate(id) {
      if (this.currentUser.id == id) {
        return;
      }
      if (!this.currentUser || this.currentUser.role !== 'admin') {
        return new Error('Somente administradores podem impersonar.');
      }
      const target = this.userClient.findItem(id);

      if (!target) return new Error('Usuário para impersonar não encontrado');

      this.currentUser = target;

      localStorage.setItem(CURRENT_USER_KEY, String(target.id));
      this._emitChange();
    }


    revertImpersonation() {
      if (this.originalUser) {
        this.currentUser = this.originalUser;

        localStorage.setItem(CURRENT_USER_KEY, String(this.originalUser.id));

        this.originalUser = null;
        this._emitChange();
      }
    }

    /**
     * Deleta a conta do usuário atual, dispara evento e faz signout.
     */
    deleteAccount() {
      if (!this.currentUser) return new Error('Nenhum usuário logado.');

      if (this.currentUser != this.originalUser) return new Error('Admin não pode deletar um user impersionado.');
      if (this.currentUser.role == "admin") return new Error('Admin não pode deletar a si próprio');

      const id = this.currentUser.id;
      const removed = this.userClient.deleteItem(id);

      if (!removed) return new Error('Falha ao deletar conta.');
      this.storage.save();
      this._emitDeletion();
      this.signout();
    }

    
    getCurrentUser() {
      return this.currentUser;
    }

    /**
     * Retorna true se houver usuário logado
     * @returns {boolean}
     */
    isLogged() {
      return this.getCurrentUser() !== null;
    }

    isOriginalUserIsAdmin() {
      return this.originalUser.role == "admin";
    }

    /**
     * Registra callback para evento de deleção de conta
     * @param {function(string)} cb - recebe id deletado
     */
    onDeleteAccount(cb) {
      if (typeof cb === 'function') this._deleteCallbacks.push(cb);
    
    }
    
    /**
     * Registra callback para mudança de sessão
     * @param {function(Object|null)} cb
     */
    onChangeUser(cb) {
      if (typeof cb === 'function') this._changeCallbacks.push(cb);
    }

    _setCurrentUser(user) {
      this.currentUser = user;
      
      localStorage.setItem(CURRENT_USER_KEY, String(user.id));
      this._emitChange();
    }

    _emitChange() {
      this._changeCallbacks.forEach(cb => {
        try { cb(this.currentUser); } catch (e) { console.error(e); }
      });
    }

    _emitDeletion() {
      this._deleteCallbacks.forEach(cb => {
        try { cb(id); } catch (e) { console.error(e); }
      });
    }
}