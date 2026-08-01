/**
 * @namespace SidebarNote.Views
 * @description Renderizadores das duas vistas principais (Lista e Editor).
 *              Retornam HTMLElement prontos.
 */
SidebarNote.Views = (() => {
  const { ICONS, NOTE_COLORS, NOTE_COLOR_ORDER, DEFAULTS, LIMITS } = SidebarNote.Constants;
  const { el, setSVG, formatDateShort, formatTime } = SidebarNote.Utils;

  /* --------------------------------------------------------------------------
   * VIEW: LISTA DE NOTAS
   * ----------------------------------------------------------------------- */

  /**
   * Renderiza a lista completa de notas.
   * @param {object} state
   * @param {Array} state.notes lista já filtrada e ordenada
   * @param {string} state.searchQuery
   * @returns {HTMLElement}
   */
  const ListView = (state) => {
    const { notes, searchQuery } = state;

    const container = el('div', { className: 'view' });

    /* --- Header --- */
    const header = el('header', { className: 'app-header' }, [
      el('div', { className: 'app-header__top' }, [
        el('h1', { className: 'app-title', text: 'Minhas Notas' }),
        el('div', { className: 'app-header__actions' }, [
          el('button', {
            className: ['btn', 'btn--icon'],
            attrs: { id: 'btn-import', title: 'Importar arquivo .txt', 'aria-label': 'Importar arquivo .txt', type: 'button' },
            dataset: { action: 'import-file' },
          }, [], (node) => setSVG(node, ICONS.UPLOAD)),
          el('button', {
            className: ['btn', 'btn--icon'],
            attrs: { id: 'btn-settings', title: 'Configurações', 'aria-label': 'Configurações', type: 'button' },
            dataset: { action: 'open-settings' },
          }, [], (node) => setSVG(node, ICONS.SETTINGS)),
          el('button', {
            className: ['btn', 'btn--icon'],
            attrs: { id: 'btn-add', title: 'Nova nota (Ctrl/Cmd + N)', 'aria-label': 'Nova nota', type: 'button' },
            style: { color: 'var(--color-primary)' },
            dataset: { action: 'add-note' },
          }, [], (node) => setSVG(node, ICONS.PLUS)),
        ]),
      ]),
      el('label', { className: 'search-box' }, [
        el('span', { className: 'search-box__icon' }, [], (node) => setSVG(node, ICONS.SEARCH)),
        el('input', {
          className: 'search-box__input',
          attrs: {
            id: 'search-input',
            type: 'search',
            placeholder: 'Pesquisar notas...',
            autocomplete: 'off',
            spellcheck: 'false',
            'aria-label': 'Pesquisar notas',
          },
          on: { input: () => {} /* controlado externamente via delegation */ },
        }, [], (node) => { if (searchQuery) node.value = searchQuery; }),
      ]),
    ]);
    container.appendChild(header);

    /* --- Hidden file input --- */
    container.appendChild(el('input', {
      className: 'hidden-input',
      attrs: { id: 'file-input', type: 'file', accept: '.txt,text/plain', tabindex: '-1' },
    }));

    /* --- Lista / Empty state --- */
    const list = el('div', { className: 'notes-list' });

    if (notes.length === 0) {
      const isSearch = !!searchQuery && searchQuery.trim().length > 0;
      const emptyTitle = isSearch ? 'Nenhuma nota encontrada' : 'Sem notas ainda';
      const emptyDesc = isSearch
        ? `Tente outros termos para "${searchQuery.trim()}".`
        : 'Clique em "Nova nota" para começar a capturar suas ideias.';

      const emptyIconSvg = isSearch ? ICONS.SEARCH : ICONS.STICKY_NOTE;

      const empty = el('div', { className: 'empty-state' }, [
        el('div', { className: 'empty-state__icon' }, [], (node) => setSVG(node, emptyIconSvg)),
        el('h2', { className: 'empty-state__title', text: emptyTitle }),
        el('p', { className: 'empty-state__description', text: emptyDesc }),
        el('button', {
          className: ['btn', 'btn--primary', 'btn--pill', 'empty-state__action'],
          attrs: { id: 'btn-empty-add', type: 'button' },
          dataset: { action: 'add-note' },
        }, [], (node) => {
          const spanIcon = el('span');
          setSVG(spanIcon, ICONS.PLUS);
          node.appendChild(spanIcon);
          node.appendChild(el('span', { text: 'Nova nota' }));
        }),
      ]);
      list.appendChild(empty);
    } else {
      notes.forEach((note) => {
        const colorKey = note.colorKey || DEFAULTS.NOTE.colorKey;
        const card = el('div', {
          className: ['note-card', `note-card--${colorKey}`],
          attrs: {
            role: 'button',
            tabindex: '0',
            'data-note-id': String(note.id),
            'aria-label': `Abrir nota: ${note.title || 'Sem título'}`,
          },
          dataset: { action: 'open-note', noteId: String(note.id) },
        }, [
          el('div', { className: 'note-card__header' }, [
            el('h3', {
              className: 'note-card__title',
              text: note.title && note.title.trim().length > 0 ? note.title : 'Sem título',
            }),
            el('span', { className: 'note-card__indicator' }),
          ]),
          el('p', {
            className: 'note-card__content',
            text: note.content && note.content.trim().length > 0
              ? note.content
              : 'Sem conteúdo adicional...',
          }),
          el('div', { className: 'note-card__footer' }, [
            el('span', {
              className: 'note-card__category',
              text: (note.category || DEFAULTS.CATEGORY).slice(0, LIMITS.CATEGORY_MAX_LENGTH),
            }),
            el('time', {
              className: 'note-card__date',
              attrs: { datetime: note.date || '' },
              text: formatDateShort(note.date),
            }),
          ]),
        ]);
        list.appendChild(card);
      });
    }

    container.appendChild(list);

    /* --- Toast anchor (vazio, usado por Components.Toast global) --- */
    return container;
  };

  /* --------------------------------------------------------------------------
   * VIEW: EDITOR
   * ----------------------------------------------------------------------- */

  /**
   * Renderiza editor de nota.
   * @param {object} state
   * @param {object} state.note
   * @param {number} state.fontSize
   * @param {boolean} state.isEditing
   * @returns {HTMLElement}
   */
  const EditorView = (state) => {
    const { note, fontSize, isEditing } = state;
    const colorKey = note.colorKey || DEFAULTS.NOTE.colorKey;

    const container = el('div', { className: ['editor', `editor--${colorKey}`] });

    /* ---- Header ---- */
    const header = el('header', { className: 'editor-header' }, [
      /* Lado esquerdo */
      el('div', { className: 'editor-header__left' }, [
        el('button', {
          className: ['btn', 'btn--icon'],
          attrs: { id: 'btn-back', title: 'Voltar (Esc)', 'aria-label': 'Voltar para lista', type: 'button' },
          dataset: { action: 'back-to-list' },
        }, [], (node) => setSVG(node, ICONS.ARROW_LEFT)),
      ]),

      /* Lado direito */
      el('div', { className: 'editor-header__right' }, [
        /* Controle de fonte */
        el('div', { className: 'font-control', attrs: { role: 'group', 'aria-label': 'Tamanho da fonte' } }, [
          el('button', {
            className: 'btn',
            attrs: { id: 'btn-font-decrease', type: 'button', title: 'Diminuir fonte', 'aria-label': 'Diminuir tamanho da fonte' },
            dataset: { action: 'font-change', delta: String(-LIMITS.FONT_SIZE_STEP) },
          }, [], (node) => setSVG(node, ICONS.MINUS)),
          el('span', { className: 'font-control__divider' }),
          el('button', {
            className: 'btn',
            attrs: { id: 'btn-font-increase', type: 'button', title: 'Aumentar fonte', 'aria-label': 'Aumentar tamanho da fonte' },
            dataset: { action: 'font-change', delta: String(LIMITS.FONT_SIZE_STEP) },
          }, [], (node) => setSVG(node, ICONS.PLUS)),
        ]),

        /* Botão Editar/Salvar */
        el('button', {
          className: ['btn', isEditing ? 'btn--primary' : 'btn--ghost'],
          attrs: {
            id: 'btn-toggle-edit',
            type: 'button',
            title: isEditing ? 'Salvar (Ctrl/Cmd + S)' : 'Editar nota',
            'aria-label': isEditing ? 'Salvar edição' : 'Editar esta nota',
          },
          dataset: { action: 'toggle-edit' },
        }, [], (node) => {
          setSVG(node, isEditing ? ICONS.SAVE : ICONS.EDIT);
          node.appendChild(el('span', { text: isEditing ? 'Salvar' : 'Editar' }));
        }),

        el('span', { className: 'toolbar-divider' }),

        /* Paleta de cores */
        el('div', { className: 'color-dropdown' }, [
          el('button', {
            className: ['btn', 'btn--icon'],
            attrs: {
              id: 'btn-color-toggle',
              type: 'button',
              title: 'Mudar cor da nota',
              'aria-label': 'Mudar cor da nota',
              'aria-haspopup': 'true',
              'aria-expanded': 'false',
            },
            dataset: { action: 'toggle-colors' },
          }, [], (node) => setSVG(node, ICONS.PALETTE)),
          el('div', {
            className: 'color-dropdown__panel',
            attrs: { id: 'color-dropdown-panel', role: 'listbox', 'aria-label': 'Cores disponíveis' },
            style: { display: 'none' },
            dataset: { noteId: String(note.id) },
          }, NOTE_COLOR_ORDER.map((key) => {
            const info = NOTE_COLORS[key];
            const isActive = key === colorKey;
            return el('button', {
              className: ['color-swatch', `color-swatch--${key}`, isActive ? 'color-swatch--active' : null],
              attrs: {
                type: 'button',
                role: 'option',
                title: info.name,
                'aria-label': `Cor ${info.name}`,
                'aria-selected': isActive ? 'true' : 'false',
              },
              dataset: { action: 'change-color', colorKey: key, noteId: String(note.id) },
            });
          })),
        ]),

        el('span', { className: 'toolbar-divider' }),

        /* Exportar */
        el('button', {
          className: ['btn', 'btn--icon'],
          attrs: { id: 'btn-export', type: 'button', title: 'Exportar como .txt', 'aria-label': 'Exportar nota como arquivo .txt' },
          dataset: { action: 'export-note' },
        }, [], (node) => setSVG(node, ICONS.DOWNLOAD)),

        /* Copiar */
        el('button', {
          className: ['btn', 'btn--icon'],
          attrs: { id: 'btn-copy', type: 'button', title: 'Copiar texto (Ctrl/Cmd + C)', 'aria-label': 'Copiar conteúdo da nota' },
          dataset: { action: 'copy-note' },
        }, [], (node) => setSVG(node, ICONS.COPY)),

        /* Excluir */
        el('button', {
          className: ['btn', 'btn--icon'],
          attrs: {
            id: 'btn-delete', type: 'button',
            title: 'Excluir nota', 'aria-label': 'Excluir esta nota',
            style: 'color: inherit;',
          },
          style: { color: 'inherit' },
          dataset: { action: 'delete-note', noteId: String(note.id) },
        }, [], (node) => {
          node.addEventListener('mouseenter', () => { node.style.color = 'var(--color-danger)'; });
          node.addEventListener('mouseleave', () => { node.style.color = ''; });
          setSVG(node, ICONS.TRASH);
        }),
      ]),
    ]);
    container.appendChild(header);

    /* ---- Área de conteúdo ---- */
    const contentArea = el('div', { className: 'editor-content' });

    /* Categoria */
    const categoryLabel = el('label', {
      className: 'category-row__label',
      attrs: { for: 'category-input' },
      text: 'Categoria:',
    });
    const categoryInput = el('input', {
      className: 'category-row__input',
      attrs: {
        id: 'category-input',
        type: 'text',
        maxlength: LIMITS.CATEGORY_MAX_LENGTH,
        placeholder: 'Nome da categoria',
        'aria-label': 'Categoria da nota',
      },
    });
    categoryInput.value = (note.category || DEFAULTS.CATEGORY).slice(0, LIMITS.CATEGORY_MAX_LENGTH);
    contentArea.appendChild(el('div', { className: 'category-row' }, [categoryLabel, categoryInput]));

    /* Título */
    if (isEditing) {
      const titleInput = el('input', {
        className: ['editor-title', 'editor-title--input'],
        attrs: {
          id: 'title-input',
          type: 'text',
          maxlength: LIMITS.TITLE_MAX_LENGTH,
          placeholder: 'Título da nota',
          'aria-label': 'Título da nota',
          spellcheck: 'true',
        },
      });
      titleInput.value = note.title || '';
      contentArea.appendChild(titleInput);
    } else {
      contentArea.appendChild(el('h1', {
        className: 'editor-title',
        attrs: { id: 'title-display' },
        text: (note.title && note.title.trim().length > 0) ? note.title : 'Sem título',
      }));
    }

    /* Corpo */
    const bodyWrapper = el('div', { className: 'editor-body' });
    if (isEditing) {
      const textarea = el('textarea', {
        className: 'editor-body__textarea',
        attrs: {
          id: 'content-textarea',
          placeholder: 'Comece a digitar suas ideias...\n\nDica: use Ctrl/Cmd + S para salvar.',
          'aria-label': 'Conteúdo da nota',
          spellcheck: 'true',
        },
      });
      textarea.value = note.content || '';
      textarea.style.fontSize = `${fontSize}px`;
      textarea.addEventListener('input', () => {
        /* Auto-ajuste de altura do textarea */
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(320, textarea.scrollHeight)}px`;
      });
      bodyWrapper.appendChild(textarea);
    } else {
      const contentEl = el('div', {
        className: 'editor-body__content',
        attrs: { id: 'content-display' },
        style: { fontSize: `${fontSize}px` },
        text: (note.content && note.content.trim().length > 0)
          ? note.content
          : 'Toque em "Editar" para adicionar conteúdo...',
      });
      bodyWrapper.appendChild(contentEl);
    }
    contentArea.appendChild(bodyWrapper);
    container.appendChild(contentArea);

    /* ---- Rodapé ---- */
    const contentLength = (note.content || '').length;
    const footer = el('div', { className: 'editor-footer' }, [
      el('div', { className: 'editor-footer__status' }, [
        el('span', { className: ['editor-footer__dot', isEditing ? 'editor-footer__dot--editing' : ''] }),
        el('span', {
          className: ['editor-footer__text', isEditing ? 'editor-footer__text--editing' : ''],
          text: isEditing ? 'Editando...' : `Salvo às ${formatTime(note.date)}`,
        }),
      ]),
      el('span', {
        className: 'editor-footer__chars',
        attrs: { 'aria-label': `Total de caracteres: ${contentLength}` },
        text: `${contentLength.toLocaleString('pt-BR')} caracteres`,
      }),
    ]);
    container.appendChild(footer);

    /* Ajusta altura inicial do textarea */
    setTimeout(() => {
      const ta = container.querySelector('#content-textarea');
      if (ta) ta.dispatchEvent(new Event('input', { bubbles: false }));
    }, 0);

    return container;
  };

  return { ListView, EditorView };
})();
