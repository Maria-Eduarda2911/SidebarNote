/**
 * @namespace SidebarNote.Utils
 * @description Funções utilitárias compartilhadas:
 *              helpers DOM, temporal helpers (debounce), formatação, segurança (SVG safe), etc.
 */
SidebarNote.Utils = (() => {
  const { LIMITS } = SidebarNote.Constants;

  /* --------------------------------------------------------------------------
   * Helpers temporais
   * ----------------------------------------------------------------------- */

  /**
   * Debounce padrão trailing (executa após `wait`ms da última invocação).
   * @template {Function} T
   * @param {T} fn
   * @param {number} wait milissegundos
   * @returns {T & { cancel: () => void, flush: () => void }}
   */
  const debounce = (fn, wait) => {
    let timeoutId = null;
    let lastThis = null;
    let lastArgs = null;
    let lastResult = undefined;

    const invoke = () => {
      const args = lastArgs;
      const thisArg = lastThis;
      lastArgs = lastThis = null;
      lastResult = args ? fn.apply(thisArg, args) : undefined;
      return lastResult;
    };

    const debounced = function debounced(...args) {
      lastThis = this;
      lastArgs = args;
      if (timeoutId != null) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        invoke();
      }, wait);
      return lastResult;
    };

    debounced.cancel = () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastArgs = lastThis = null;
    };

    debounced.flush = () => {
      if (timeoutId == null) return lastResult;
      clearTimeout(timeoutId);
      timeoutId = null;
      return invoke();
    };

    // @ts-ignore
    return debounced;
  };

  /* --------------------------------------------------------------------------
   * Helpers DOM seguros
   * ----------------------------------------------------------------------- */

  /**
   * Cria um elemento com atributos e filhos de forma declarativa.
   * NÃO usa innerHTML. Seguro contra XSS por padrão.
   * @param {string} tag
   * @param {object} [props]
   * @param {Record<string,string>} [props.attrs] atributos HTML (string only)
   * @param {Record<string,string>} [props.style] estilos inline
   * @param {Record<string,function>} [props.on] handlers de evento
   * @param {string|string[]} [props.className] classes CSS
   * @param {string} [props.text] texto interno (textContent seguro)
   * @param {string} [props.html] conteúdo HTML SÓ se a flag allowHtml for true + trusted
   * @param {boolean} [props.allowHtml] permite html (perigoso, só usar para SVG em strings whitelisted)
   * @param {function(HTMLElement):void} [props.init] callback executado APÓS criar o nó e adicionar filhos
   * @param {Array<string|Node|number|null|undefined>} [children]
   * @param {function(HTMLElement):void} [afterCreate] callback executado no final
   * @returns {HTMLElement}
   */
  const el = (tag, props = {}, children = [], afterCreate = null) => {
    const node = document.createElement(tag);

    /* className */
    if (props.className) {
      const classes = Array.isArray(props.className)
        ? props.className.filter(Boolean)
        : [props.className];
      if (classes.length) node.className = classes.join(' ');
    }

    /* Atributos */
    if (props.attrs) {
      Object.entries(props.attrs).forEach(([key, value]) => {
        if (value == null) return;
        try {
          node.setAttribute(key, String(value));
        } catch (_err) { /* atributos inválidos são ignorados */ }
      });
    }

    /* Estilos inline */
    if (props.style) {
      Object.entries(props.style).forEach(([key, value]) => {
        if (value == null) return;
        const cssKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        try {
          node.style[cssKey] = String(value);
        } catch (_err) { /* no-op */ }
      });
    }

    /* Eventos */
    if (props.on) {
      Object.entries(props.on).forEach(([eventName, handler]) => {
        if (typeof handler === 'function') {
          node.addEventListener(eventName, handler, { passive: false });
        }
      });
    }

    /* Dataset */
    if (props.dataset) {
      Object.entries(props.dataset).forEach(([key, value]) => {
        if (value != null) node.dataset[key] = String(value);
      });
    }

    /* Texto / Conteúdo */
    if (typeof props.text === 'string') {
      node.textContent = props.text;
    } else if (props.html && props.allowHtml === true) {
      /* Apenas para HTML whitelisted / controlado internamente. */
      node.innerHTML = props.html;
    }

    /* Filhos */
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach((child) => {
      if (child == null || child === false) return;
      if (child instanceof Node) {
        node.appendChild(child);
      } else if (typeof child === 'string' || typeof child === 'number') {
        node.appendChild(document.createTextNode(String(child)));
      }
    });

    /* Callbacks pós-criação */
    if (typeof props.init === 'function') {
      try { props.init(node); } catch (_err) { /* no-op */ }
    }
    if (typeof afterCreate === 'function') {
      try { afterCreate(node); } catch (_err2) { /* no-op */ }
    }

    return node;
  };

  /**
   * Define um SVG em um elemento de forma SEGURA (DOMParser + cloneNode).
   * Previne XSS vetoriais através de SVG malicioso (event handlers inline etc).
   * @param {HTMLElement} target elemento onde o SVG será anexado
   * @param {string} svgString string SVG whitelisted (das constantes)
   * @returns {boolean} sucesso
   */
  const setSVG = (target, svgString) => {
    if (!target || typeof svgString !== 'string') return false;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const root = doc.documentElement;
      if (!root || root.tagName.toLowerCase() !== 'svg') return false;
      if (root.nodeName === 'parsererror') return false;
      /* Remove atributos potencialmente perigosos (inline handlers JS, external refs) */
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
      let current = walker.nextNode();
      while (current) {
        const elNode = /** @type {Element} */ (current);
        /* Remove qualquer atributo on* (onclick, onerror, onload etc) */
        const attributesToRemove = [];
        for (let i = 0; i < elNode.attributes.length; i++) {
          const attrName = elNode.attributes[i].name.toLowerCase();
          if (attrName.startsWith('on')) attributesToRemove.push(attrName);
          if (attrName === 'href' || attrName === 'xlink:href') {
            const value = elNode.attributes[i].value.toLowerCase();
            if (value.startsWith('javascript:')) attributesToRemove.push(attrName);
          }
        }
        attributesToRemove.forEach((a) => elNode.removeAttribute(a));
        current = walker.nextNode();
      }
      const safeSVG = /** @type {Element} */ (root.cloneNode(true));
      target.appendChild(safeSVG);
      return true;
    } catch (err) {
      console.warn('[Utils.setSVG] Falha ao processar SVG:', err);
      return false;
    }
  };

  /**
   * Limpa todos os filhos de um elemento de forma performática.
   * @param {Element} node
   */
  const clearChildren = (node) => {
    if (!node) return;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };

  /* --------------------------------------------------------------------------
   * Formatação de datas (locale pt-BR)
   * ----------------------------------------------------------------------- */

  /**
   * Formata uma data ISO em estilo curto (ex: "2 de jan").
   * @param {string|Date|null} dateInput
   * @returns {string}
   */
  const formatDateShort = (dateInput) => {
    if (!dateInput) return '';
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (Number.isNaN(date.getTime())) return '';
      const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
      const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      return `${day} de ${month}`;
    } catch (_err) {
      return '';
    }
  };

  /**
   * Formata horário "HH:mm" (pt-BR).
   * @param {string|Date|null} dateInput
   * @returns {string}
   */
  const formatTime = (dateInput) => {
    if (!dateInput) return '';
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (_err) {
      return '';
    }
  };

  /**
   * Retorna a data formatada em "hoje/ontem/dd/mm/aaaa" (pt-BR).
   * @param {string|Date} dateInput
   * @returns {string}
   */
  const formatRelativeDate = (dateInput) => {
    if (!dateInput) return '';
    try {
      const target = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (Number.isNaN(target.getTime())) return '';
      const now = new Date();
      const sameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
      if (sameDay(target, now)) return 'hoje';
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (sameDay(target, yesterday)) return 'ontem';
      return target.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (_err) {
      return formatDateShort(dateInput);
    }
  };

  /* --------------------------------------------------------------------------
   * Validações
   * ----------------------------------------------------------------------- */

  const clamp = (value, min, max) => {
    const v = Number(value);
    if (Number.isNaN(v)) return min;
    return Math.max(min, Math.min(max, v));
  };

  const isValidNoteId = (id) => typeof id === 'number' || (typeof id === 'string' && id !== '');

  /* Limpeza de nome de arquivo para exportação */
  const sanitizeFilename = (name, fallback = 'minha_nota') => {
    if (typeof name !== 'string' || name.trim().length === 0) return fallback;
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase() || fallback;
  };

  /* --------------------------------------------------------------------------
   * Clipboard / download
   * ----------------------------------------------------------------------- */

  const copyTextToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (err) {
      console.error('[Utils.copyTextToClipboard] Falha:', err);
      return false;
    }
  };

  const triggerDownload = (content, filename, mime = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: `${mime};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (err) {
      console.error('[Utils.triggerDownload] Falha:', err);
      return false;
    }
  };

  return {
    debounce,
    el,
    setSVG,
    clearChildren,
    formatDateShort,
    formatTime,
    formatRelativeDate,
    clamp,
    isValidNoteId,
    sanitizeFilename,
    copyTextToClipboard,
    triggerDownload,
    LIMITS_REF: LIMITS,
  };
})();
