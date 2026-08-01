/**
 * @namespace SidebarNote.Storage
 * @description Abstração de camada de persistência.
 *              Prioriza `chrome.storage.local` (nativo MV3) quando disponível,
 *              senão usa `localStorage` como fallback.
 *              Também realiza migração de dados legados (v0.KEYS).
 */
SidebarNote.Storage = (() => {
  const { STORAGE_KEYS, DEFAULTS } = SidebarNote.Constants;

  /* ---- Detecção de ambiente ---- */
  const HAS_CHROME_STORAGE = (
    typeof chrome !== 'undefined' &&
    chrome.storage &&
    typeof chrome.storage.local === 'object' &&
    typeof chrome.storage.local.get === 'function' &&
    typeof chrome.storage.local.set === 'function'
  );

  /* ---- Helpers internos ---- */
  const safeParse = (raw, fallback = null) => {
    if (raw == null) return fallback;
    if (typeof raw !== 'string') return raw;
    try {
      return JSON.parse(raw);
    } catch (_err) {
      console.warn('[Storage] JSON parse falhou, usando fallback:', fallback);
      return fallback;
    }
  };

  const safeStringify = (value) => {
    try {
      return JSON.stringify(value);
    } catch (err) {
      console.error('[Storage] JSON stringify falhou:', err);
      throw err;
    }
  };

  const readLocalStorage = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return safeParse(raw, fallback);
    } catch (err) {
      console.warn('[Storage] Falha ao ler localStorage key=', key, err);
      return fallback;
    }
  };

  const writeLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, safeStringify(value));
      return true;
    } catch (err) {
      console.error('[Storage] Falha ao gravar localStorage key=', key, err);
      return false;
    }
  };

  /**
   * Lê do chrome.storage.local (retorna Promise).
   * @param {string} key
   * @param {*} fallback
   * @returns {Promise<*>}
   */
  const readChromeLocal = async (key, fallback = null) => {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.warn('[Storage] chrome.storage.local.get error:', chrome.runtime.lastError.message);
            resolve(fallback);
            return;
          }
          const raw = result?.[key];
          resolve(raw == null ? fallback : raw);
        });
      } catch (err) {
        console.warn('[Storage] Exceção chrome.storage.local.get:', err);
        resolve(fallback);
      }
    });
  };

  /**
   * Escreve no chrome.storage.local.
   * @param {string} key
   * @param {*} value
   * @returns {Promise<boolean>} sucesso
   */
  const writeChromeLocal = async (key, value) => {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.error('[Storage] chrome.storage.local.set error:', chrome.runtime.lastError.message);
            resolve(false);
            return;
          }
          resolve(true);
        });
      } catch (err) {
        console.error('[Storage] Exceção chrome.storage.local.set:', err);
        resolve(false);
      }
    });
  };

  /* ---- Migração de dados legados (storage v0 → v1) ---- */
  const migrateIfNeeded = async () => {
    const migrated = { notes: null, settings: null };

    /* Tenta do storage localstorage LEGACY (chaves antigas) */
    const legacyNotes = readLocalStorage(STORAGE_KEYS.LEGACY_NOTES, null);
    const legacyFontSize = readLocalStorage(STORAGE_KEYS.LEGACY_FONT_SIZE, null);

    /* Também verifica se já há no storage novo (não sobrescreve) */
    const existingNotes = HAS_CHROME_STORAGE
      ? await readChromeLocal(STORAGE_KEYS.NOTES, null)
      : readLocalStorage(STORAGE_KEYS.NOTES, null);

    const existingSettings = HAS_CHROME_STORAGE
      ? await readChromeLocal(STORAGE_KEYS.SETTINGS, null)
      : readLocalStorage(STORAGE_KEYS.SETTINGS, null);

    if (!existingNotes && Array.isArray(legacyNotes)) {
      migrated.notes = legacyNotes;
    }
    if (!existingSettings && (typeof legacyFontSize === 'number' || typeof legacyFontSize === 'string')) {
      migrated.settings = { ...DEFAULTS.SETTINGS, fontSize: Number(legacyFontSize) };
    }

    if (migrated.notes) {
      if (HAS_CHROME_STORAGE) await writeChromeLocal(STORAGE_KEYS.NOTES, migrated.notes);
      else writeLocalStorage(STORAGE_KEYS.NOTES, migrated.notes);
    }
    if (migrated.settings) {
      if (HAS_CHROME_STORAGE) await writeChromeLocal(STORAGE_KEYS.SETTINGS, migrated.settings);
      else writeLocalStorage(STORAGE_KEYS.SETTINGS, migrated.settings);
    }

    /* Limpa chaves legadas após migração (cuidado, só se migrou) */
    if (migrated.notes || migrated.settings) {
      try {
        if (migrated.notes) localStorage.removeItem(STORAGE_KEYS.LEGACY_NOTES);
        if (migrated.settings) localStorage.removeItem(STORAGE_KEYS.LEGACY_FONT_SIZE);
      } catch (_) { /* no-op */ }
    }

    return migrated;
  };

  /* ---- API pública ---- */

  /**
   * Carrega notas e configurações (inicializa e migra se necessário).
   * @returns {Promise<{notes: Array, settings: object}>}
   */
  const loadAll = async () => {
    const migrated = await migrateIfNeeded();
    let notes, settings;

    if (HAS_CHROME_STORAGE) {
      notes = await readChromeLocal(STORAGE_KEYS.NOTES, null);
      settings = await readChromeLocal(STORAGE_KEYS.SETTINGS, null);
    } else {
      notes = readLocalStorage(STORAGE_KEYS.NOTES, null);
      settings = readLocalStorage(STORAGE_KEYS.SETTINGS, null);
    }

    return {
      notes: Array.isArray(notes) ? notes : null,
      settings: settings && typeof settings === 'object' ? settings : null,
    };
  };

  /**
   * Salva todas as notas.
   * @param {Array} notes
   * @returns {Promise<boolean>}
   */
  const saveNotes = async (notes) => {
    if (!Array.isArray(notes)) {
      console.warn('[Storage] saveNotes recebeu valor não-array');
      return false;
    }
    if (HAS_CHROME_STORAGE) {
      return writeChromeLocal(STORAGE_KEYS.NOTES, notes);
    }
    return writeLocalStorage(STORAGE_KEYS.NOTES, notes);
  };

  /**
   * Salva configurações.
   * @param {object} settings
   * @returns {Promise<boolean>}
   */
  const saveSettings = async (settings) => {
    if (!settings || typeof settings !== 'object') {
      console.warn('[Storage] saveSettings recebeu valor não-objeto');
      return false;
    }
    if (HAS_CHROME_STORAGE) {
      return writeChromeLocal(STORAGE_KEYS.SETTINGS, settings);
    }
    return writeLocalStorage(STORAGE_KEYS.SETTINGS, settings);
  };

  return {
    loadAll,
    saveNotes,
    saveSettings,
    /** Usado em síncrono (fallback síncrono para casos específicos). */
    _isChromeStorage: HAS_CHROME_STORAGE,
  };
})();
