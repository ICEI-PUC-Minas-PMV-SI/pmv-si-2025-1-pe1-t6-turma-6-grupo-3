const USER_LIST_KEY = 'notebook_user_list';
const CURRENT_USER_KEY = 'notebook_current_user';
const _callbacks = [];
class MockUserApi {
    // Mapa interno de usuários (chave: nome, valor: true)
    static _users = new Map();

    /**
     * Inicializa o serviço com dados do localStorage ou usuário padrão
     * @param {string} defaultUser
     */
    static init(defaultUser = 'default') {
      const raw = localStorage.getItem(USER_LIST_KEY);
      const list = raw ? JSON.parse(raw) : [defaultUser];
      this._users.clear();
      list.forEach(u => this._users.set(u, true));

      const current = localStorage.getItem(CURRENT_USER_KEY);
      if (!current || !this._users.has(current)) {
        localStorage.setItem(CURRENT_USER_KEY, defaultUser);
      }
      this.notifyChange(this.getCurrentUser());
    }

    /**
     * Persiste o mapa de usuários no localStorage
     */
    static _persistUsers() {
      localStorage.setItem(
        USER_LIST_KEY,
        JSON.stringify(Array.from(this._users.keys()))
      );
    }

    /**
     * Retorna lista de nomes de usuários
     * @returns {string[]}
     */
    static getUsers() {
      return Array.from(this._users.keys());
    }

    /**
     * Adiciona um novo usuário (se ainda não existir)
     * @param {string} name
     * @returns {string[]} lista atualizada
     */
    static addUser(name) {
      if (!name) throw new Error('Nome de usuário inválido');
      if (!this._users.has(name)) {
        this._users.set(name, true);
        this._persistUsers();
        this.notifyChange(name);
      }
      return this.getUsers();
    }

    /**
     * Define qual usuário está ativo
     * @param {string} name
     * @returns {string}
     */
    static setCurrentUser(name) {
      if (!this._users.has(name)) throw new Error('Usuário não encontrado');
      localStorage.setItem(CURRENT_USER_KEY, name);
      this.notifyChange(name);
      return name;
    }

    /**
     * Retorna o usuário ativo
     * @returns {string|null}
     */
    static getCurrentUser() {
      return localStorage.getItem(CURRENT_USER_KEY);
    }

    /**
     * Inscreve uma função para ser chamada quando o usuário atual mudar
     * @param {(name: string) => void} callback
     */
    static onChange(callback) {
      if (typeof callback === 'function') {
        _callbacks.push(callback);
      }
    }

    /**
     * Notifica todos os inscritos sobre a mudança de usuário
     * @param {string} name
     */
    static notifyChange(name) {
      _callbacks.forEach(cb => {
        try { cb(name); } catch (e) { console.error(e); }
      });
    }
  }