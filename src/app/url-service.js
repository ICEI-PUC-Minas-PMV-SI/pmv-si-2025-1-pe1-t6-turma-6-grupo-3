
class UrlService {
    /**
     * Retorna o valor do parâmetro de querystring
     * @param {string} key - nome do parâmetro
     * @returns {string|null}
     */
    getParam(key) {
      const params = new URLSearchParams(window.location.search);
      return params.has(key) ? params.get(key) : null;
    }

    /**
     * Retorna todos os parâmetros como objeto { chave: valor }
     * @returns {Object<string,string>}
     */
    getAllParams() {
      const params = new URLSearchParams(window.location.search);
      const result = {};
      for (const [k, v] of params.entries()) {
        result[k] = v;
      }
      return result;
    }
  }