/**
 * @namespace SidebarNote.Components
 * @description Componentes UI reutilizáveis: Toast e Backdrop/Modal base.
 */
SidebarNote.Components = (() => {
  const { ICONS, LIMITS } = SidebarNote.Constants;
  const { el, setSVG, clearChildren } = SidebarNote.Utils;

  /* --------------------------------------------------------------------------
   * TOAST
   * ----------------------------------------------------------------------- */
  const Toast = (() => {
    let toastEl = null;
    let hideTimer = null;

    const ensureElement = () => {
      if (toastEl && document.body.contains(toastEl)) return toastEl;
      toastEl = el('div', {
        className: 'toast',
        attrs: { role: 'status', 'aria-live': 'polite' },
      }, [
        el('span', { className: 'toast__icon' }),
        el('span', { className: 'toast__message' }),
      ]);
      document.body.appendChild(toastEl);
      return toastEl;
    };

    /**
     * Mostra uma notificação toast.
     * @param {string} message
     * @param {object} [opts]
     * @param {'success'|'info'|'error'} [opts.variant]
     * @param {number} [opts.durationMs]
     */
    const show = (message, opts = {}) => {
      const node = ensureElement();
      const iconNode = node.querySelector('.toast__icon');
      const msgNode = node.querySelector('.toast__message');
      if (iconNode) clearChildren(iconNode);

      if (msgNode) msgNode.textContent = message;
      if (iconNode) {
        const variant = opts.variant || 'success';
        const svgStr = variant === 'error' ? ICONS.X : ICONS.CHECK;
        setSVG(iconNode, svgStr);
        iconNode.style.color = variant === 'error' ? 'var(--color-danger)' : '';
      }

      node.classList.add('toast--visible');
      if (hideTimer) clearTimeout(hideTimer);
      const duration = opts.durationMs || LIMITS.TOAST_DURATION_MS;
      hideTimer = setTimeout(() => {
        node.classList.remove('toast--visible');
      }, duration);
    };

    const hide = () => {
      if (!toastEl) return;
      toastEl.classList.remove('toast--visible');
      if (hideTimer) clearTimeout(hideTimer);
    };

    return { show, hide };
  })();

  /* --------------------------------------------------------------------------
   * MODAL (base)
   * ----------------------------------------------------------------------- */
  /**
   * Cria modal com backdrop, retornando API para fechar.
   * @param {object} opts
   * @param {string} [opts.title]
   * @param {HTMLElement|HTMLElement[]} [opts.body]
   * @param {HTMLElement|HTMLElement[]} [opts.footer]
   * @param {boolean} [opts.showClose=true]
   * @param {boolean} [opts.closeOnBackdrop=true]
   * @param {boolean} [opts.closeOnEsc=true]
   * @param {(function|null)} [opts.onClose]
   * @param {string} [opts.size=md] 'sm' | 'md' | 'lg'
   * @returns {{ close: () => void, element: HTMLElement }}
   */
  const Modal = (opts) => {
    const {
      title,
      body = null,
      footer = null,
      showClose = true,
      closeOnBackdrop = true,
      closeOnEsc = true,
      onClose = null,
    } = opts;

    const backdrop = el('div', {
      className: 'modal-backdrop',
      attrs: { role: 'dialog', 'aria-modal': 'true' },
    });

    const modal = el('div', { className: 'modal' });
    backdrop.appendChild(modal);

    /* --- Header --- */
    const headerParts = [];
    if (title) {
      headerParts.push(el('h2', { className: 'modal__title', text: title }));
    }
    if (showClose) {
      const closeBtn = el('button', {
        className: ['btn', 'btn--icon', 'modal__close'],
        attrs: { type: 'button', title: 'Fechar', 'aria-label': 'Fechar' },
      });
      setSVG(closeBtn, ICONS.X);
      closeBtn.addEventListener('click', close);
      headerParts.push(closeBtn);
    }
    if (headerParts.length) {
      modal.appendChild(el('div', { className: 'modal__header' }, headerParts));
    }

    /* --- Body --- */
    if (body) {
      const bodyNode = el('div', { className: 'modal__body' });
      const arr = Array.isArray(body) ? body : [body];
      arr.filter(Boolean).forEach((child) => bodyNode.appendChild(child));
      modal.appendChild(bodyNode);
    }

    /* --- Footer --- */
    if (footer) {
      const footerNode = el('div', { className: 'modal__footer' });
      const arr = Array.isArray(footer) ? footer : [footer];
      arr.filter(Boolean).forEach((child) => footerNode.appendChild(child));
      modal.appendChild(footerNode);
    }

    /* --- Fechamento --- */
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      if (closeOnEsc) document.removeEventListener('keydown', onKey, true);
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      if (typeof onClose === 'function') {
        try { onClose(); } catch (_) { /* no-op */ }
      }
    }
    function onKey(e) {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        close();
      }
    }

    if (closeOnEsc) document.addEventListener('keydown', onKey, true);
    if (closeOnBackdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) close();
      });
    }

    document.body.appendChild(backdrop);
    setTimeout(() => {
      const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 10);

    return { close, element: backdrop };
  };

  /* --------------------------------------------------------------------------
   * CONFIRM DIALOG (Modal de confirmação customizado)
   * ----------------------------------------------------------------------- */
  /**
   * Modal de confirmação estilo confirm() mas visual moderno.
   * @param {object} opts
   * @param {string} opts.title
   * @param {string} [opts.description]
   * @param {string} [opts.confirmText]
   * @param {string} [opts.cancelText]
   * @param {'danger'|'primary'} [opts.variant='danger']
   * @param {boolean} [opts.destructive=true]
   * @returns {Promise<boolean>}
   */
  const ConfirmDialog = (opts) => new Promise((resolve) => {
    const {
      title,
      description = '',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      variant = 'danger',
    } = opts;

    const iconSvg = variant === 'danger' ? ICONS.ALERT : ICONS.SETTINGS;
    const iconBox = el('div', { className: 'confirm-modal__icon' });
    setSVG(iconBox, iconSvg);

    const bodyNodes = [
      iconBox,
      el('div', { className: 'confirm-modal__title', text: title }),
      description ? el('div', { className: 'confirm-modal__description', text: description }) : null,
    ].filter(Boolean);

    const confirmBtn = el('button', {
      className: ['btn', variant === 'danger' ? 'btn--danger' : 'btn--primary', 'btn--ghost'],
      attrs: { type: 'button' },
      style: variant === 'danger' ? {
        backgroundColor: 'var(--color-danger)',
        color: 'white',
        borderColor: 'transparent',
      } : undefined,
      text: confirmText,
    });
    confirmBtn.addEventListener('mouseover', () => {
      if (variant === 'danger') confirmBtn.style.backgroundColor = 'var(--color-danger-hover)';
    });
    confirmBtn.addEventListener('mouseout', () => {
      if (variant === 'danger') confirmBtn.style.backgroundColor = 'var(--color-danger)';
    });

    const cancelBtn = el('button', {
      className: ['btn', 'btn--ghost'],
      attrs: { type: 'button' },
      text: cancelText,
    });

    let resolved = false;
    const finish = (value) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };

    confirmBtn.addEventListener('click', () => finish(true));
    cancelBtn.addEventListener('click', () => finish(false));

    const { close } = Modal({
      showClose: false,
      closeOnBackdrop: true,
      closeOnEsc: true,
      body: bodyNodes,
      footer: el('div', { className: ['modal__footer', 'modal__footer--row'] }, [
        confirmBtn,
        cancelBtn,
      ]),
      onClose: () => finish(false),
    });

    return close;
  });

  return { Toast, Modal, ConfirmDialog };
})();
