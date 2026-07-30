// Acesso a localStorage/sessionStorage à prova de falha.
//
// Motivo: o storage tem limite de ~5 MB e lança QuotaExceededError ao estourar.
// Se isso acontecer dentro de um componente, o React derruba a árvore inteira e
// o usuário vê uma tela branca. Também quebra em navegação anônima no Safari e
// quando o usuário bloqueia cookies/storage do site.
//
// Regra: nunca guardar imagem aqui — só identificadores e estado leve.

const noop = () => {};

function safeGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch (err) {
    // Quota estourada ou storage indisponível — segue sem persistir.
    console.warn(`Não foi possível salvar "${key}" no storage:`, err?.name || err);
    return false;
  }
}

function safeRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    noop();
  }
}

// Sessão (limpa ao fechar a aba) — usada para restaurar a Home ao voltar do detalhe
export const session = {
  get: (key) => safeGet(sessionStorage, key),
  set: (key, value) => safeSet(sessionStorage, key, value),
  remove: (key) => safeRemove(sessionStorage, key),

  getJSON(key) {
    const raw = this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      // JSON corrompido de uma versão antiga — descarta em vez de quebrar
      this.remove(key);
      return null;
    }
  },

  setJSON(key, value) {
    try {
      return this.set(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },
};

// Persistente (sobrevive ao fechar o navegador) — usada para token/usuário
export const local = {
  get: (key) => safeGet(localStorage, key),
  set: (key, value) => safeSet(localStorage, key, value),
  remove: (key) => safeRemove(localStorage, key),

  getJSON(key) {
    const raw = this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      this.remove(key);
      return null;
    }
  },

  setJSON(key, value) {
    try {
      return this.set(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },
};
