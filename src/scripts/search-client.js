/**
 * SearchClient com suporte a busca exata + fuzzy (Levenshtein).
 */
class SearchClient {
  /**
   * @param {object} options
   * @param {number} [options.bloomSizeBits=100000]
   * @param {number} [options.fuzzyMaxDistance=2]
   */
  constructor(options = {}) {
    const { bloomSizeBits = 100000, fuzzyMaxDistance = 2 } = options;
    this.bloomSizeBits = bloomSizeBits;           // ← Armazena pra usar depois
    this.bloom = new BloomFilter(bloomSizeBits);
    this.indexMap = new Map();    // Map<string, Item[]>
    this.allTerms = new Set();    // Set<string> de todas as chaves indexadas
    this.fuzzyMaxDistance = fuzzyMaxDistance;
  }

  /**
   * Adiciona um Item ao índice:
   *  - BloomFilter
   *  - allTerms
   *  - indexMap (termo → lista de Items)
   */
  addItem(item) {
    if (!item.terms || !Array.isArray(item.terms)) return;

    for (const termoRaw of item.terms) {
      const termo = termoRaw.toString().toLowerCase();

      // 1) BloomFilter
      this.bloom.add(termo);

      // 2) allTerms
      this.allTerms.add(termo);

      // 3) indexMap
      if (!this.indexMap.has(termo)) {
        this.indexMap.set(termo, []);
      }
      const lista = this.indexMap.get(termo);
      const jaExiste = lista.some(existing => SearchClient._isSameItem(existing, item));
      if (!jaExiste) {
        lista.push(item);
      }
    }
  }

  /**
   * Busca exata (Bloom + Map). Retorna array de Items ou [].
   */
  searchExact(term) {
    if (!term || typeof term !== "string") return [];
    const termo = term.toLowerCase();

    if (!this.bloom.has(termo)) {
      return [];
    }
    return this.indexMap.get(termo) || [];
  }

  /**
   * Busca fuzzy: percorre todas as chaves (allTerms), calcula Levenshtein,
   * agrega itens cuja distância ≤ fuzzyMaxDistance.
   */
  searchFuzzy(term) {
    if (!term || typeof term !== "string") return [];
    const termo = term.toLowerCase();
    const resultadosSet = new Set();

    for (const chave of this.allTerms) {
      const dist = levenshtein(termo, chave);
      if (dist <= this.fuzzyMaxDistance) {
        const lista = this.indexMap.get(chave) || [];
        for (const item of lista) {
          resultadosSet.add(item);
        }
      }
    }

    return Array.from(resultadosSet);
  }

  /**
   * Busca “integrada”: primeiro exata; se vazio, chama fuzzy.
   */
  search(term) {
    const exatos = this.searchExact(term);
    if (exatos.length >= 5) {
      return exatos;
    }
    const fuzzy = this.searchFuzzy(term)
    const filtrados = fuzzy.filter(fItem =>
      !exatos.some(eItem => SearchClient._isSameItem(eItem, fItem))
    );

    return [...exatos, ...filtrados];
  }

  /**
   * Compara dois Items (mesma lógica usada em addItem para evitar duplicatas).
   */
  static _isSameItem(a, b) {
    if (a.type !== b.type) return false;
    if (a.localization.notebook_id !== b.localization.notebook_id) return false;
    // if (a.localization.user !== b.localization.user) return false;
    if ((a.localization.content_id || null) !== (b.localization.content_id || null)) return false;
    if ((a.localization.node_id || null) !== (b.localization.node_id || null)) return false;
    return true;
  }

   /**
   * Remove um item do índice:
   * 1) Atualiza indexMap e allTerms removendo todas as ocorrências de item.terms
   * 2) Reconstrói o Bloom Filter a partir dos termos que restarem em allTerms
   */
  removeItem(item) {
    if (!item.terms || !Array.isArray(item.terms)) {
      return;
    }

    // 1) Atualiza indexMap e allTerms
    for (const termoRaw of item.terms) {
      const termo = termoRaw.toString().toLowerCase();

      // Se não existia esse termo, pula
      if (!this.indexMap.has(termo)) continue;

      // Filtra o array removendo o item “igual” a este
      const lista = this.indexMap.get(termo);
      const novaLista = lista.filter(existing => !SearchClient._isSameItem(existing, item));

      if (novaLista.length === 0) {
        // Se não sobrou nenhum item para esse termo, deleta a chave inteira
        this.indexMap.delete(termo);
        this.allTerms.delete(termo);
      } else {
        // Ainda existem outros itens que usam esse termo
        this.indexMap.set(termo, novaLista);
        // Não remove de allTerms, pois ainda há itens que usam esse termo
      }
    }

    // 2) Reconstrói o Bloom Filter por completo
    // Cria um novo Bloom Filter “zerado” com o mesmo tamanho original
    this.bloom = new BloomFilter(this.bloomSizeBits);

    // Re-inseri todos os termos que ainda existem em allTerms
    // (ou seja, todas as chaves de indexMap)
    for (const termoRestante of this.allTerms) {
      this.bloom.add(termoRestante);
    }
  }

   /**
   * Atualiza vários itens de uma única vez:
   * - Cada elemento de `updates` é um objeto { oldItem, newItem }.
   * - Remove referências de oldItem, adiciona referências de newItem a indexMap/allTerms.
   * - No final, reconstrói o BloomFilter apenas uma vez a partir de allTerms.
   *
   * @param {Array<{oldItem: Item, newItem: Item}>} updates
   */
  updateMany(updates) {
    console.log("updateMany::updates", updates)
    if (!Array.isArray(updates) || updates.length === 0) return;

    // 1) Para cada par { oldItem, newItem }, removemos referências de oldItem de indexMap/allTerms
    for (const { oldItem } of updates) {
      if (!oldItem || !oldItem.terms) continue;
      for (const rawTerm of oldItem.terms) {
        const term = rawTerm.toString().toLowerCase();
        if (!this.indexMap.has(term)) continue;

        // Filtra a lista removendo exatamente esse oldItem
        const lista = this.indexMap.get(term);
        const filtered = lista.filter(existing =>
          !SearchClient._isSameItem(existing, oldItem)
        );

        if (filtered.length === 0) {
          // Se ninguém mais usa esse termo, remove a chave
          this.indexMap.delete(term);
          this.allTerms.delete(term);
        } else {
          this.indexMap.set(term, filtered);
          // Se ainda existeem outros itens, a chave permanece em allTerms
        }
      }
    }

    // 2) Para cada par { oldItem, newItem }, adicionamos referências de newItem
    for (const { newItem } of updates) {
      if (!newItem || !newItem.terms) continue;
      for (const rawTerm of newItem.terms) {
        const term = rawTerm.toString().toLowerCase();

        // Garante que allTerms tenha esse termo
        this.allTerms.add(term);

        // Insere newItem em indexMap[term] (evita duplicata)
        if (!this.indexMap.has(term)) {
          this.indexMap.set(term, []);
        }
        const lista = this.indexMap.get(term);
        const exists = lista.some(existing =>
          SearchClient._isSameItem(existing, newItem)
        );
        if (!exists) {
          lista.push(newItem);
        }
      }
    }

    // 3) Reconstrói o BloomFilter uma única vez com todos os termos que restam em allTerms
    this.bloom = new BloomFilter(this.bloomSizeBits);
    for (const term of this.allTerms) {
      this.bloom.add(term);
    }
  }

  /**
   * (Nova) Reseta todo o índice e reconstrói a partir de um array de itens.
   * @param {Array<Item>} newItems
   */
  reset(newItems) {
    // 1) Limpa completamente os dados
    this.indexMap.clear();
    this.allTerms.clear();
    this.bloom = new BloomFilter(this.bloomSizeBits);

    // 2) Adiciona cada item da lista
    if (Array.isArray(newItems)) {
      for (const item of newItems) {
        this.addItem(item);
      }
    }
  }

   /**
   * Adds a single term for an existing item.
   * - Updates only that term in the BloomFilter and indexMap.
   */
  addTermToItem(item, rawTerm) {
    const term = rawTerm.toString().toLowerCase();

    // 1) Mark in BloomFilter
    this.bloom.add(term);

    // 2) Ensure term is in allTerms
    this.allTerms.add(term);

    // 3) Add item under this term in indexMap
    if (!this.indexMap.has(term)) {
      this.indexMap.set(term, []);
    }
    const list = this.indexMap.get(term);
    const alreadyExists = list.some(existing =>
      SearchClient._isSameItem(existing, item)
    );
    if (!alreadyExists) {
      list.push(item);
    }
  }
}

/**
 * Extrai termos de uma string longa, removendo stopwords em PT e EN.
 * - Normaliza acentos (NFD + remoção de diacríticos).
 * - Converte tudo para lowercase.
 * - Separa por caracteres não alfanuméricos.
 * - Filtra stopwords de português/inglês e tokens muito curtos (tamanho < 2).
 * - Remove duplicatas (retorna array de termos únicos).
 *
 * @param {string} text  String de entrada (pode conter frases longas).
 * @returns {string[]}   Array de termos extraídos.
 */
function extractTerms(text) {
  if (typeof text !== "string") return [];

  // 1) Lista de stopwords em português e inglês
  const stopwordsPT = [
    "a", "à", "às", "ao", "aos", "o", "os",
    "um", "uma", "uns", "umas",
    "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "por", "pelo", "pela", "pelos", "pelas",
    "para", "com", "sem", "sob", "sobre", "entre", "e", "é", "que",
    "se", "um", "uma", "mais", "mas", "ou", "como", "seu", "sua",
    "seus", "suas", "dos", "das", "este", "esta", "estes", "estas",
    "esse", "essa", "esses", "essas", "aquele", "aquela", "aqueles", "aquelas",
    "ambos", "cada", "muito", "muita", "muitos", "muitas", "tudo", "toda", "todos", "todas"
  ];
  const stopwordsEN = [
    "a", "an", "and", "the", "is", "are", "in", "on", "at", "by", "for", "with",
    "to", "of", "from", "that", "this", "it", "as", "be", "or", "was", "were",
    "but", "if", "not", "both", "about", "into", "over", "after", "before",
    "between", "out", "up", "down", "so", "no", "yes"
  ];

  // 2) Concatena e transforma em Set para busca rápida
  const stopSet = new Set(
    stopwordsPT.map(w => w.toLowerCase())
      .concat(stopwordsEN.map(w => w.toLowerCase()))
  );

  // 3) Normaliza acentos (NFD + remoção de diacríticos)
  // Exemplo: “ação” → “acao”
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove marcas de acentuação
    .toLowerCase();

  // 4) Separa em tokens: tudo que não for a–z ou 0–9 vira delimitador
  const tokens = normalized.split(/[^a-z0-9]+/);

  // 5) Filtra tokens curtos e stopwords
  const termosFiltrados = tokens.filter(token => {
    if (token.length < 2) return false;           // descarta “a”, “o”, “1” etc.
    if (stopSet.has(token)) return false;         // descarta stopwords
    return true;
  });

  // 6) Remove duplicatas (mantendo a ordem de aparição)
  const vistos = new Set();
  const termosUnicos = [];
  for (const termo of termosFiltrados) {
    if (!vistos.has(termo)) {
      vistos.add(termo);
      termosUnicos.push(termo);
    }
  }

  return termosUnicos;
}

/**
 * Distância de Levenshtein entre strings a e b.
 */
function levenshtein(a, b) {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1));

  for (let i = 0; i <= lenA; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    const charA = a.charAt(i - 1);
    for (let j = 1; j <= lenB; j++) {
      const charB = b.charAt(j - 1);
      const cost = charA === charB ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[lenA][lenB];
}

/**
 * BloomFilter simples em JavaScript puro.
 * Usa dois hashes (djb2 e sdbm) e um Uint8Array como bit array.
 */
class BloomFilter {
  /**
   * @param {number} sizeBits  Número de bits do filtro (p. ex. 100000).
   */
  constructor(sizeBits = 100000) {
    this.size = sizeBits;
    // Uint8Array de bytes; cada posição representa 1 bit (0 ou 1).
    // Mas Uint8Array armazena bytes. Para simplificar, vamos usar 1 byte por bit.
    // Se precisar de mais eficiência, podemos usar bitwise para compressão, mas aqui usaremos 1 byte por bit.
    this.bits = new Uint8Array(sizeBits);
  }

  /**
   * Função de hash djb2 (retorna inteiro >= 0).
   * https://theartincode.stanis.me/008-djb2/
   */
  _djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
      hash = hash & 0xFFFFFFFF; // mantém 32 bits
    }
    return Math.abs(hash);
  }

  /**
   * Função de hash sdbm (retorna inteiro >= 0).
   * https://stackoverflow.com/a/52171480
   */
  _sdbm(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
      hash = hash & 0xFFFFFFFF; // mantém 32 bits
    }
    return Math.abs(hash);
  }

  /**
   * Adiciona a string `value` ao Bloom Filter.
   */
  add(value) {
    const h1 = this._djb2(value) % this.size;
    const h2 = this._sdbm(value) % this.size;
    this.bits[h1] = 1;
    this.bits[h2] = 1;
  }

  /**
   * Verifica se `value` possivelmente existe no filtro.
   * Retorna false se com certeza não existe; true se possivelmente existe.
   */
  has(value) {
    const h1 = this._djb2(value) % this.size;
    const h2 = this._sdbm(value) % this.size;
    return this.bits[h1] === 1 && this.bits[h2] === 1;
  }
}
