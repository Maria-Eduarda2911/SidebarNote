/**
 * @namespace SidebarNote.App
 * @class NotesApp
 * @description Classe principal da aplicação.
 *              Coordena estado global, storage, renderização, eventos e atalhos.
 */
SidebarNote.App = (() => {
  const {
    STORAGE_KEYS, LIMITS, ICONS, NOTE_COLORS, DEFAULTS,
  } = SidebarNote.Constants;

  const Storage = SidebarNote.Storage;
  const { Toast, Modal, ConfirmDialog } = SidebarNote.Components;
  const { ListView, EditorView } = SidebarNote.Views;

  const {
    el, setSVG, clearChildren,
    debounce, formatDateShort,
    clamp, isValidNoteId, sanitizeFilename,
    copyTextToClipboard, triggerDownload,
  } = SidebarNote.Utils;

  /* ================================================================
   * CLASSE PRINCIPAL
   * ============================================================== */
  class NotesApp {
    constructor(rootEl) {
      if (!rootEl || !(rootEl instanceof HTMLElement)) {
        throw new Error('[NotesApp] Elemento root inválido');
      }

      this.root = rootEl;
      this.notes = [];
      this.settings = { ...DEFAULTS.SETTINGS };
      this.view = DEFAULTS.VIEW_LIST;
      this.activeNoteId = null;
      this.searchQuery = '';
      this.isEditing = false;

      /* Debounced para reduzir writes */
      this._debouncedSaveNotes = debounce(() => this._flushNotes(), LIMITS.AUTOSAVE_DEBOUNCE_MS);
      this._debouncedSearch = debounce((value) => this._onSearchInput(value), LIMITS.SEARCH_DEBOUNCE_MS);
      this._debouncedSaveSettings = debounce(() => this._flushSettings(), 200);

      /* Flags de lifecycle */
      this._initialized = false;
      this._currentListeners = new Set();

      /* Bind handlers (não dependeam do this no delegation via arrow é ok, mas por segurança) */
      this._handleRootClick = this._handleRootClick.bind(this);
      this._handleRootKeydown = this._handleRootKeydown.bind(this);
      this._handleDocumentClick = this._handleDocumentClick.bind(this);
      this._handleGlobalKeydown = this._handleGlobalKeydown.bind(this);
    }

    /* ----------------------------------------------------------------
     * Inicialização pública
     * -------------------------------------------------------------- */
    async init() {
      if (this._initialized) return;

      try {
        const { notes, settings } = await Storage.loadAll();

        /* Garante sempre lista inicial com nota de boas-vindas (igual legado) */
        if (!Array.isArray(notes) || notes.length === 0) {
          this.notes = [this._createWelcomeNote()];
          await Storage.saveNotes(this.notes);
        } else {
          this.notes = this._migrateNotesShape(notes);
        }

        if (settings && typeof settings === 'object') {
          this.settings = { ...DEFAULTS.SETTINGS, ...settings };
        }
        this.settings.fontSize = clamp(
          this.settings.fontSize ?? LIMITS.FONT_SIZE_DEFAULT,
          LIMITS.FONT_SIZE_MIN, LIMITS.FONT_SIZE_MAX,
        );

      } catch (err) {
        console.error('[NotesApp.init] Erro fatal na inicialização:', err);
        this.notes = [this._createWelcomeNote()];
        this.settings = { ...DEFAULTS.SETTINGS };
      }

      this._attachGlobalListeners();
      this.render();
      this._initialized = true;
    }

    /* ----------------------------------------------------------------
     * State helpers
     * -------------------------------------------------------------- */

    _getActiveNote() {
      return this.notes.find((n) => isValidNoteId(this.activeNoteId) && n.id === this.activeNoteId) || null;
    }

    _getFilteredNotes() {
      const q = this.searchQuery.trim().toLowerCase();
      const filtered = q.length === 0
        ? this.notes.slice()
        : this.notes.filter((n) => {
          const title = (n.title || '').toLowerCase();
          const content = (n.content || '').toLowerCase();
          const category = (n.category || '').toLowerCase();
          return title.includes(q) || content.includes(q) || category.includes(q);
        });
      return filtered.sort((a, b) => {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        return db - da;
      });
    }

    _createWelcomeNote() {
      return {
        id: Date.now(),
        title: 'Bem-vindo(a) ao SidebarNote! 👋',
        content: [
          'Esta é sua nova sidebar de notas.',
          '',
          'Dicas rápidas:',
          '  • Clique em "Nova nota" para começar',
          '  • Use Ctrl/Cmd + N para criar uma nota',
          '  • Use Ctrl/Cmd + F para pesquisar',
          '  • Clique em uma cor para alterar o fundo',
          '  • Suas notas são salvas automaticamente',
          '',
          'Aproveite! 🚀',
        ].join('\n'),
        date: new Date().toISOString(),
        colorKey: 'yellow',
        category: DEFAULTS.CATEGORY,
      };
    }

    /** Garante que notas antigas (migradas) tem shape correto. */
    _migrateNotesShape(notes) {
      if (!Array.isArray(notes)) return [];
      return notes.map((note, idx) => {
        if (!note || typeof note !== 'object') {
          return this._createWelcomeNote();
        }
        const id = typeof note.id === 'number'
          ? note.id
          : Date.now() + idx;
        return {
          id,
          title: typeof note.title === 'string' ? note.title : DEFAULTS.NOTE.title,
          content: typeof note.content === 'string' ? note.content : DEFAULTS.NOTE.content,
          date: (typeof note.date === 'string' && note.date.length > 0)
            ? note.date
            : new Date(Date.now() - (notes.length - idx) * 1000).toISOString(),
          colorKey: NOTE_COLORS[note.colorKey] ? note.colorKey : DEFAULTS.NOTE.colorKey,
          category: typeof note.category === 'string' && note.category.trim().length > 0
            ? note.category
            : DEFAULTS.CATEGORY,
        };
      });
    }

    /* ----------------------------------------------------------------
     * Persistência (agendadas + flush)
     * -------------------------------------------------------------- */
    _scheduleSaveNotes() {
      this._debouncedSaveNotes();
    }
    async _flushNotes() {
      try {
        const ok = await Storage.saveNotes(this.notes);
        if (ok) Toast.show('Notas salvas', { variant: 'success', durationMs: 1400 });
      } catch (err) {
        console.error('[NotesApp._flushNotes] Erro ao salvar:', err);
        Toast.show('Erro ao salvar', { variant: 'error' });
      }
    }
    _scheduleSaveSettings() {
      this._debouncedSaveSettings();
    }
    async _flushSettings() {
      try {
        await Storage.saveSettings(this.settings);
      } catch (err) {
        console.error('[NotesApp._flushSettings] Erro:', err);
      }
    }

    /* ----------------------------------------------------------------
     * Operações com notas
     * -------------------------------------------------------------- */
    addNote() {
      const newNote = {
        id: Date.now(),
        title: '',
        content: '',
        date: new Date().toISOString(),
        colorKey: DEFAULTS.NOTE.colorKey,
        category: DEFAULTS.CATEGORY,
      };
      this.notes.unshift(newNote);
      this.activeNoteId = newNote.id;
      this.view = DEFAULTS.VIEW_EDITOR;
      this.isEditing = true;
      this._scheduleSaveNotes();
      this.render();
    }

    openNoteById(id) {
      if (!isValidNoteId(id)) return;
      const idx = this.notes.findIndex((n) => n.id === id);
      if (idx === -1) return;
      this.activeNoteId = id;
      this.view = DEFAULTS.VIEW_EDITOR;
      /* Abrir direto em modo leitura (reduzir um clique: usaremos isEditing=true?
         UX-wise melhor abrir em edição direta se for recente?
         Mantemos leitura padrão (igual app Notion) mas toggle rápido.
         Vamos manter leitura e 1 clique no Salvar/Editar. */
      this.isEditing = false;
      this.render();
    }

    closeNote() {
      /* Se estiver em edição, garante que salvou antes de voltar */
      if (this.isEditing) {
        this._debouncedSaveNotes.flush();
      }
      this.view = DEFAULTS.VIEW_LIST;
      this.activeNoteId = null;
      this.isEditing = false;
      this.render();
    }

    toggleEditMode() {
      if (this.view !== DEFAULTS.VIEW_EDITOR || !this._getActiveNote()) return;
      const wasEditing = this.isEditing;
      this.isEditing = !this.isEditing;
      /* Se estava editando e agora saiu → força persistência */
      if (wasEditing === true) {
        this._debouncedSaveNotes.flush();
        Toast.show('Alterações salvas', { variant: 'success', durationMs: 1800 });
      }
      this.render();
    }

    updateActiveNoteField(field, value, updateDate = true) {
      const note = this._getActiveNote();
      if (!note) return;
      if (typeof note[field] === typeof value) {
        note[field] = value;
      } else if (typeof value === 'string') {
        note[field] = value;
      }
      if (updateDate) note.date = new Date().toISOString();
      this._scheduleSaveNotes();
    }

    updateActiveNoteColor(colorKey) {
      const note = this._getActiveNote();
      if (!note) return;
      if (!NOTE_COLORS[colorKey]) return;
      if (note.colorKey === colorKey) return;
      note.colorKey = colorKey;
      note.date = new Date().toISOString();
      this._scheduleSaveNotes();
      this.render();
    }

    async deleteActiveNote() {
      const note = this._getActiveNote();
      if (!note) return;
      const preview = (note.title || 'Sem título').slice(0, 40);
      const ok = await ConfirmDialog({
        title: 'Excluir esta nota?',
        description: `"${preview}" será removido permanentemente. Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        variant: 'danger',
      });
      if (!ok) return;
      this.notes = this.notes.filter((n) => n.id !== note.id);
      this.activeNoteId = null;
      this.view = DEFAULTS.VIEW_LIST;
      this.isEditing = false;
      this._scheduleSaveNotes();
      Toast.show('Nota excluída', { durationMs: 1600 });
      this.render();
    }

    changeFontSize(delta) {
      const newSize = clamp(
        this.settings.fontSize + Number(delta || 0),
        LIMITS.FONT_SIZE_MIN, LIMITS.FONT_SIZE_MAX,
      );
      if (newSize === this.settings.fontSize) return;
      this.settings.fontSize = newSize;
      this._scheduleSaveSettings();
      /* Apenas atualiza estilos relevantes (sem re-render total) */
      this._patchFontSizeOnly();
    }

    _patchFontSizeOnly() {
      if (this.view !== DEFAULTS.VIEW_EDITOR) return;
      const ta = document.getElementById('content-textarea');
      const disp = document.getElementById('content-display');
      if (ta) ta.style.fontSize = `${this.settings.fontSize}px`;
      if (disp) disp.style.fontSize = `${this.settings.fontSize}px`;
    }

    async copyActiveNote() {
      const note = this._getActiveNote();
      if (!note) return;
      const text = [note.title, note.content].filter((x) => (x || '').trim().length > 0).join('\n\n');
      const ok = await copyTextToClipboard(text);
      if (ok) Toast.show('Copiado para a área de transferência', { durationMs: 1600 });
      else Toast.show('Falha ao copiar', { variant: 'error' });
    }

    exportActiveNote() {
      const note = this._getActiveNote();
      if (!note) return;
      const content = `${note.title || 'Sem Título'}\n\n${note.content}`;
      const baseName = sanitizeFilename(note.title, 'minha_nota');
      const fileName = `${baseName}.txt`;
      const ok = triggerDownload(content, fileName, 'text/plain');
      if (ok) Toast.show(`Exportado: ${fileName}`, { durationMs: 1800 });
    }

    async exportAllNotes() {
      if (this.notes.length === 0) {
        Toast.show('Nenhuma nota para exportar', { variant: 'info', durationMs: 1600 });
        return;
      }
      const lines = [];
      this.notes.forEach((note, idx) => {
        lines.push(`=== ${note.title || 'Sem Título'} ===`);
        lines.push(`Categoria: ${note.category || DEFAULTS.CATEGORY}`);
        lines.push(`Data: ${formatDateShort(note.date)}`);
        lines.push('');
        lines.push(note.content || '');
        if (idx < this.notes.length - 1) {
          lines.push('');
          lines.push('---');
          lines.push('');
        }
      });
      const today = new Date().toISOString().slice(0, 10);
      const ok = triggerDownload(lines.join('\n'), `minhas_notas_${today}.txt`);
      if (ok) Toast.show('Todas as notas foram exportadas', { durationMs: 2000 });
    }

    async clearAllNotes() {
      if (this.notes.length === 0) return;
      const ok = await ConfirmDialog({
        title: 'Apagar todas as notas?',
        description: `Isso removerá ${this.notes.length} nota(s) permanentemente. Não é possível recuperar.`,
        confirmText: 'Apagar tudo',
        cancelText: 'Cancelar',
        variant: 'danger',
      });
      if (!ok) return;
      this.notes = [];
      this.activeNoteId = null;
      this.view = DEFAULTS.VIEW_LIST;
      this.isEditing = false;
      this.searchQuery = '';
      this._scheduleSaveNotes();
      Toast.show('Todas as notas foram apagadas', { durationMs: 1600 });
      this.render();
    }

    importNoteFromFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onerror = () => {
        Toast.show('Erro ao importar arquivo', { variant: 'error' });
      };
      reader.onload = () => {
        try {
          const content = typeof reader.result === 'string' ? reader.result : '';
          const title = (file.name || '')
            .replace(/\.txt$/i, '')
            .replace(/_+/g, ' ')
            .trim();
          const newNote = {
            id: Date.now(),
            title: title.slice(0, LIMITS.TITLE_MAX_LENGTH),
            content,
            date: new Date().toISOString(),
            colorKey: DEFAULTS.NOTE.colorKey,
            category: DEFAULTS.IMPORT_CATEGORY,
          };
          this.notes.unshift(newNote);
          this.activeNoteId = newNote.id;
          this.view = DEFAULTS.VIEW_EDITOR;
          this.isEditing = true;
          this._scheduleSaveNotes();
          Toast.show('Nota importada com sucesso', { durationMs: 1600 });
          this.render();
        } catch (err) {
          console.error(err);
          Toast.show('Erro ao importar', { variant: 'error' });
        }
      };
      reader.readAsText(file, 'utf-8');
    }

    /* ----------------------------------------------------------------
     * Settings Modal
     * -------------------------------------------------------------- */
    openSettingsModal() {
      const totalNotes = this.notes.length;
      const totalChars = this.notes.reduce(
        (sum, n) => sum + ((typeof n.content === 'string') ? n.content.length : 0), 0,
      );

      const statsCard = el('div', { className: 'stats-card' }, [
        el('div', { className: 'stats-card__title', text: 'Estatísticas' }),
        el('div', { className: 'stats-card__list' }, [
          el('div', { className: 'stats-card__item' }, [
            el('span', { className: 'stats-card__label', text: 'Total de notas' }),
            el('span', { className: 'stats-card__value', text: String(totalNotes) }),
          ]),
          el('div', { className: 'stats-card__item' }, [
            el('span', { className: 'stats-card__label', text: 'Caracteres escritos' }),
            el('span', { className: 'stats-card__value', text: totalChars.toLocaleString('pt-BR') }),
          ]),
        ]),
      ]);

      const exportAllBtn = el('button', {
        className: ['btn', 'btn--primary'],
        attrs: { type: 'button' },
        text: 'Exportar todas as notas',
        on: {
          click: () => this.exportAllNotes(),
        },
      }, [], (node) => {
        setSVG(node, ICONS.FILE_DOWNLOAD);
        node.insertBefore(node.lastChild, node.firstChild);
      });

      const clearAllBtn = el('button', {
        className: ['btn', 'btn--ghost'],
        style: {
          color: 'var(--color-danger)',
          borderColor: 'var(--color-danger-border)',
        },
        attrs: { type: 'button' },
        text: 'Apagar todas as notas',
        on: { click: () => this.clearAllNotes() },
      }, [], (node) => {
        setSVG(node, ICONS.TRASH);
        node.insertBefore(node.lastChild, node.firstChild);
        node.addEventListener('mouseenter', () => {
          node.style.backgroundColor = 'var(--color-danger-bg)';
        });
        node.addEventListener('mouseleave', () => {
          node.style.backgroundColor = '';
        });
      });

      Modal({
        title: 'Configurações',
        showClose: true,
        body: [
          statsCard,
          el('div', {
            attrs: { style: 'height: 1px; background: var(--color-border); opacity: 0.6;' },
          }),
        ],
        footer: [exportAllBtn, clearAllBtn],
      });
    }

    /* ----------------------------------------------------------------
     * Renderização principal
     * -------------------------------------------------------------- */
    render() {
      clearChildren(this.root);

      if (this.view === DEFAULTS.VIEW_LIST) {
        const filtered = this._getFilteredNotes();
        const listEl = ListView({ notes: filtered, searchQuery: this.searchQuery });
        this.root.appendChild(listEl);
        /* Re-aplica o valor do input (mantém cursor) */
        const searchInput = document.getElementById('search-input');
        if (searchInput && this.searchQuery) {
          searchInput.value = this.searchQuery;
        }
      } else if (this.view === DEFAULTS.VIEW_EDITOR) {
        const note = this._getActiveNote();
        if (!note) {
          this.view = DEFAULTS.VIEW_LIST;
          this.render();
          return;
        }
        const editorEl = EditorView({
          note,
          fontSize: this.settings.fontSize,
          isEditing: this.isEditing,
        });
        this.root.appendChild(editorEl);

        /* Auto-focus no campo título ou textarea se em edição */
        if (this.isEditing) {
          setTimeout(() => {
            const titleInput = document.getElementById('title-input');
            const textarea = document.getElementById('content-textarea');
            if (titleInput) {
              if ((note.title || '').length === 0) {
                titleInput.focus({ preventScroll: true });
              } else if (textarea) {
                textarea.focus({ preventScroll: true });
                try {
                  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                } catch (_) { /* no-op */ }
              }
            }
          }, 30);
        }
      }
    }

    /* ----------------------------------------------------------------
     * Event delegation (na raiz #root e document)
     * -------------------------------------------------------------- */
    _attachGlobalListeners() {
      this.root.addEventListener('click', this._handleRootClick);
      this.root.addEventListener('keydown', this._handleRootKeydown);
      document.addEventListener('click', this._handleDocumentClick, true);
      document.addEventListener('keydown', this._handleGlobalKeydown);
    }

    _handleRootClick(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      /* Encontra o elemento com data-action */
      const actionEl = target.closest('[data-action]');
      if (!actionEl || !(actionEl instanceof HTMLElement)) return;

      const action = actionEl.dataset.action;
      switch (action) {
        case 'add-note':
          event.preventDefault();
          this.addNote();
          break;
        case 'open-settings':
          event.preventDefault();
          this.openSettingsModal();
          break;
        case 'import-file': {
          event.preventDefault();
          const fi = document.getElementById('file-input');
          if (fi) fi.click();
          break;
        }
        case 'open-note': {
          event.preventDefault();
          const id = this._parseId(actionEl.dataset.noteId);
          if (id != null) this.openNoteById(id);
          break;
        }
        case 'back-to-list':
          event.preventDefault();
          this.closeNote();
          break;
        case 'toggle-edit':
          event.preventDefault();
          this.toggleEditMode();
          break;
        case 'font-change': {
          event.preventDefault();
          const delta = Number(actionEl.dataset.delta || 0);
          this.changeFontSize(delta);
          break;
        }
        case 'toggle-colors': {
          event.preventDefault();
          event.stopPropagation();
          const panel = document.getElementById('color-dropdown-panel');
          const btn = document.getElementById('btn-color-toggle');
          if (!panel) break;
          const isOpen = panel.style.display !== 'none';
          panel.style.display = isOpen ? 'none' : 'grid';
          if (btn) btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
          break;
        }
        case 'change-color': {
          event.preventDefault();
          event.stopPropagation();
          const colorKey = actionEl.dataset.colorKey;
          if (colorKey) this.updateActiveNoteColor(colorKey);
          break;
        }
        case 'export-note':
          event.preventDefault();
          this.exportActiveNote();
          break;
        case 'copy-note':
          event.preventDefault();
          this.copyActiveNote();
          break;
        case 'delete-note': {
          event.preventDefault();
          this.deleteActiveNote();
          break;
        }
        default:
          break;
      }
    }

    _handleRootKeydown(e) {
      /* Navegação com Enter/Space nos cards (role="button") */
      if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLElement) {
        const card = e.target.closest('.note-card');
        if (card && card.dataset.action === 'open-note') {
          e.preventDefault();
          const id = this._parseId(card.dataset.noteId);
          if (id != null) this.openNoteById(id);
        }
      }
    }

    _handleDocumentClick(e) {
      /* Fecha dropdown de cores quando clica fora */
      const panel = document.getElementById('color-dropdown-panel');
      const btn = document.getElementById('btn-color-toggle');
      if (!panel) return;
      if (panel.style.display === 'none') return;
      if (!e.target) return;
      const inside = e.target.closest('#btn-color-toggle, #color-dropdown-panel');
      if (!inside) {
        panel.style.display = 'none';
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }

    _handleGlobalKeydown(e) {
      /* Ignore se foco em um input */
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      const inField = tag === 'input' || tag === 'textarea' || tag === 'select';

      /* Shortcuts com Ctrl/Cmd */
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            this.addNote();
            return;
          case 'f':
            e.preventDefault();
            this.view = DEFAULTS.VIEW_LIST;
            this.render();
            setTimeout(() => {
              const search = document.getElementById('search-input');
              if (search) {
                search.focus();
                try { search.select(); } catch (_) { /* no-op */ }
              }
            }, 10);
            return;
          case 's':
            if (this.view === DEFAULTS.VIEW_EDITOR && this.isEditing) {
              e.preventDefault();
              this.toggleEditMode(); /* salva */
            } else if (this.view === DEFAULTS.VIEW_EDITOR && !this.isEditing) {
              e.preventDefault();
              this.toggleEditMode(); /* entra em edição */
            }
            return;
          default:
            break;
        }
      }

      /* Esc: voltar lista / fechar modal (modal usa esc separado) */
      if (e.key === 'Escape' && !e.defaultPrevented) {
        if (this.view === DEFAULTS.VIEW_EDITOR) {
          e.preventDefault();
          this.closeNote();
        }
        return;
      }

      /* Campo Search oninput → debounced */
      if (inField && e.target && e.target.id === 'search-input') {
        /* Atualiza estado de busca sincronamente para exibir em UI */
        const v = e.target.value || '';
        this.searchQuery = v;
        /* Debounce no re-render para não travar em bases grandes */
        this._debouncedSearch(v);
        return;
      }

      if (this.view === DEFAULTS.VIEW_EDITOR) {
        if (inField) {
          if (e.target.id === 'title-input') {
            const val = e.target.value || '';
            this.updateActiveNoteField('title', val.slice(0, LIMITS.TITLE_MAX_LENGTH));
          } else if (e.target.id === 'content-textarea') {
            const val = e.target.value || '';
            this.updateActiveNoteField('content', val);
            const footerChars = document.querySelector('.editor-footer__chars');
            if (footerChars) {
              footerChars.textContent = `${val.length.toLocaleString('pt-BR')} caracteres`;
            }
          } else if (e.target.id === 'category-input') {
            const val = e.target.value || DEFAULTS.CATEGORY;
            this.updateActiveNoteField('category', val.slice(0, LIMITS.CATEGORY_MAX_LENGTH), false);
          }
        }
      }
    }

    _onSearchInput(/* value */) {
      /* Re-render apenas da lista (mantém foco) */
      if (this.view !== DEFAULTS.VIEW_LIST) return;
      const filtered = this._getFilteredNotes();
      const viewNode = this.root.firstElementChild;
      if (!viewNode) { this.render(); return; }
      const oldList = viewNode.querySelector('.notes-list');
      const newListView = ListView({ notes: filtered, searchQuery: this.searchQuery });
      const newList = newListView.querySelector('.notes-list');
      if (oldList && newList && oldList.parentNode) {
        oldList.parentNode.replaceChild(newList, oldList);
      } else {
        this.render();
      }
      const searchInput = document.getElementById('search-input');
      if (searchInput && document.activeElement !== searchInput) {
        searchInput.value = this.searchQuery;
      }
    }

    _parseId(raw) {
      if (raw == null) return null;
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
      if (typeof raw === 'string' && raw.length > 0) return raw;
      return null;
    }
  }

  /* ----------------------------------------------------------------
   * Bootstrap (executado ao carregar)
   * -------------------------------------------------------------- */
  const bootstrap = async () => {
    const root = document.getElementById('root');
    if (!root) {
      console.error('[SidebarNote] Elemento #root não encontrado');
      return;
    }
    try {
      const app = new NotesApp(root);
      await app.init();
      /* Expõe para debug (apenas em dev se quiser) */
      window.__SidebarNoteApp = app;
    } catch (err) {
      console.error('[SidebarNote] Bootstrap falhou:', err);
      root.textContent = 'Ocorreu um erro ao carregar as notas. Tente recarregar a página.';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }

  return { NotesApp, bootstrap };
})();
