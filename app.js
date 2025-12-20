// Ícones SVG minimalistas
const ICONS = {
  back: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 19l-7-7 7-7"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 20h9M1.5 8.5l5-5L19 6.5l-5 5M3 20.5V17l13-13"/></svg>',
  save: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-7H7v7M7 3v5h8V3"/></svg>',
  download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M15 2H9a1 1 0 0 0-1 1v2h8V3a1 1 0 0 0-1-1z"/></svg>',
  delete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/></svg>',
  upload: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  palette: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/><circle cx="17" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/><circle cx="7" cy="12" r="1.5" fill="currentColor"/></svg>'
};

// Cores das notas com seus estilos
const NOTE_COLORS = {
  yellow: { bg: '#fffbeb', border: '#fef08a', name: 'Amarelo' },
  blue: { bg: '#eff6ff', border: '#bfdbfe', name: 'Azul' },
  pink: { bg: '#fdf2f8', border: '#fbcfe8', name: 'Rosa' },
  green: { bg: '#ecfdf5', border: '#a7f3d0', name: 'Verde' },
  purple: { bg: '#f5f3ff', border: '#ddd6fe', name: 'Roxo' },
  orange: { bg: '#fff7ed', border: '#fed7aa', name: 'Laranja' },
  red: { bg: '#fef2f2', border: '#fecaca', name: 'Vermelho' },
  gray: { bg: '#f9fafb', border: '#e5e7eb', name: 'Cinza' }
};

// Aplicação de Notas para Chrome
class NotesApp {
  constructor() {
    this.notes = this.loadNotes();
    this.fontSize = localStorage.getItem('sidebar-notes-fontsize') || 14;
    this.view = 'list';
    this.activeNoteId = null;
    this.searchQuery = '';
    this.isEditing = false;
    
    this.init();
  }

  // Função auxiliar para definir SVG com segurança
  setSVG(element, svgString) {
    const parser = new DOMParser();
    const svg = parser.parseFromString(svgString, 'image/svg+xml');
    if (svg.documentElement.tagName !== 'parsererror') {
      const svgElement = svg.documentElement.cloneNode(true);
      element.appendChild(svgElement);
    }
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  loadNotes() {
    try {
      const stored = localStorage.getItem('sidebar-notes-data');
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Erro ao carregar notas:', e); }
    
    return [{
      id: 1,
      title: 'Bem-vindo ao Addon!',
      content: 'Esta é sua nova sidebar de notas.\n\n- Clique em editar para mudar o texto.\n- Use os botões A+ e A- para ajustar a fonte.\n- Suas notas são salvas automaticamente.',
      date: new Date().toISOString(),
      colorKey: 'yellow',
      category: 'Geral'
    }];
  }

  saveNotes() {
    try {
      localStorage.setItem('sidebar-notes-data', JSON.stringify(this.notes));
    } catch (e) { console.error('Erro ao salvar notas:', e); }
  }

  saveFontSize() {
    localStorage.setItem('sidebar-notes-fontsize', this.fontSize);
  }

  addNote() {
    const newNote = {
      id: Date.now(),
      title: '',
      content: '',
      date: new Date().toISOString(),
      colorKey: 'gray',
      category: 'Geral'
    };
    this.notes.unshift(newNote);
    this.saveNotes();
    this.activeNoteId = newNote.id;
    this.view = 'editor';
    this.isEditing = true;
    this.render();
    this.attachEventListeners();
  }

  openNote(id) {
    this.activeNoteId = id;
    this.view = 'editor';
    this.isEditing = false;
    this.render();
    this.attachEventListeners();
  }

  closeNote() {
    this.view = 'list';
    this.activeNoteId = null;
    this.isEditing = false;
    this.render();
    this.attachEventListeners();
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    this.render();
    this.attachEventListeners();
  }

  updateNote(id, field, value) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note[field] = value;
      note.date = new Date().toISOString();
      this.saveNotes();
    }
  }

  updateNoteColor(id, colorKey) {
    const note = this.notes.find(n => n.id === id);
    if (note && NOTE_COLORS[colorKey]) {
      note.colorKey = colorKey;
      this.saveNotes();
    }
  }

  deleteNote(id) {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      this.notes = this.notes.filter(n => n.id !== id);
      this.saveNotes();
      this.closeNote();
    }
  }

  changeFontSize(delta) {
    this.fontSize = Math.max(12, Math.min(parseInt(this.fontSize) + delta, 28));
    this.saveFontSize();
    this.render();
    this.attachEventListeners();
  }

  copyToClipboard() {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (note) {
      const text = `${note.title}\n\n${note.content}`;
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copiado!');
      });
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = '✓ ' + message;
      toast.style.opacity = '1';
      setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }
  }

  exportNote() {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;
    
    const content = `${note.title || 'Sem Título'}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = note.title ? note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'minha_nota';
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const title = file.name.replace('.txt', '');
      
      const newNote = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toISOString(),
        colorKey: 'gray',
        category: 'Importado'
      };

      this.notes.unshift(newNote);
      this.saveNotes();
      this.activeNoteId = newNote.id;
      this.view = 'editor';
      this.isEditing = true;
      this.render();
      this.attachEventListeners();
    };
    reader.readAsText(file);
  }

  showSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-width: 400px; width: 90%;';
    
    const title = document.createElement('h2');
    title.style.cssText = 'font-size: 1.25rem; font-weight: bold; color: #1f2937; margin: 0 0 1rem 0;';
    title.textContent = 'Configurações';
    content.appendChild(title);
    
    // Total de notas
    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem;';
    
    const statsTitle = document.createElement('p');
    statsTitle.style.cssText = 'font-size: 0.875rem; font-weight: bold; color: #6b7280; margin: 0 0 0.75rem 0; text-transform: uppercase; letter-spacing: 0.05em;';
    statsTitle.textContent = 'Estatísticas';
    statsDiv.appendChild(statsTitle);
    
    const statsList = document.createElement('div');
    statsList.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';
    
    const totalNotesItem = document.createElement('div');
    totalNotesItem.style.cssText = 'display: flex; justify-content: space-between; font-size: 0.875rem; color: #374151;';
    const totalSpan = document.createElement('span');
    totalSpan.textContent = 'Total de notas:';
    const totalStrong = document.createElement('strong');
    totalStrong.textContent = this.notes.length;
    totalNotesItem.appendChild(totalSpan);
    totalNotesItem.appendChild(totalStrong);
    statsList.appendChild(totalNotesItem);
    
    const totalCharsItem = document.createElement('div');
    totalCharsItem.style.cssText = 'display: flex; justify-content: space-between; font-size: 0.875rem; color: #374151;';
    const totalChars = this.notes.reduce((sum, note) => sum + ((note.content && note.content.length) || 0), 0);
    const charsSpan = document.createElement('span');
    charsSpan.textContent = 'Total de caracteres:';
    const charsStrong = document.createElement('strong');
    charsStrong.textContent = totalChars.toLocaleString('pt-BR');
    totalCharsItem.appendChild(charsSpan);
    totalCharsItem.appendChild(charsStrong);
    statsList.appendChild(totalCharsItem);
    
    statsDiv.appendChild(statsList);
    content.appendChild(statsDiv);
    
    // Opções
    const optionsDiv = document.createElement('div');
    optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';
    
    const exportAllBtn = document.createElement('button');
    exportAllBtn.style.cssText = 'padding: 0.75rem 1rem; background: #4f46e5; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: bold; transition: all 0.2s;';
    exportAllBtn.textContent = 'Exportar Todas as Notas';
    exportAllBtn.onmouseover = () => exportAllBtn.style.backgroundColor = '#4338ca';
    exportAllBtn.onmouseout = () => exportAllBtn.style.backgroundColor = '#4f46e5';
    exportAllBtn.onclick = () => this.exportAllNotes();
    optionsDiv.appendChild(exportAllBtn);
    
    const clearAllBtn = document.createElement('button');
    clearAllBtn.style.cssText = 'padding: 0.75rem 1rem; background: #f3f4f6; color: #dc2626; border: 1px solid #fecaca; border-radius: 0.5rem; cursor: pointer; font-weight: bold; transition: all 0.2s;';
    clearAllBtn.textContent = 'Apagar Todas as Notas';
    clearAllBtn.onmouseover = () => clearAllBtn.style.backgroundColor = '#fee2e2';
    clearAllBtn.onmouseout = () => clearAllBtn.style.backgroundColor = '#f3f4f6';
    clearAllBtn.onclick = () => {
      if (confirm('Tem certeza? Isto não pode ser desfeito!')) {
        this.notes = [];
        this.saveNotes();
        document.getElementById('settings-modal').remove();
        this.render();
        this.attachEventListeners();
      }
    };
    optionsDiv.appendChild(clearAllBtn);
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'padding: 0.75rem 1rem; background: transparent; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; font-weight: bold; transition: all 0.2s;';
    closeBtn.textContent = 'Fechar';
    closeBtn.onmouseover = () => closeBtn.style.backgroundColor = '#f9fafb';
    closeBtn.onmouseout = () => closeBtn.style.backgroundColor = 'transparent';
    closeBtn.onclick = () => modal.remove();
    optionsDiv.appendChild(closeBtn);
    
    content.appendChild(optionsDiv);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  exportAllNotes() {
    if (this.notes.length === 0) {
      alert('Nenhuma nota para exportar!');
      return;
    }

    let content = '';
    this.notes.forEach((note, index) => {
      content += `=== ${note.title || 'Sem Título'} ===\nCategoria: ${note.category}\nData: ${this.formatDate(note.date)}\n\n${note.content}\n\n`;
      if (index < this.notes.length - 1) content += '---\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minhas_notas_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    document.getElementById('settings-modal').remove();
    this.showToast('Exportado com sucesso!');
  }

  formatDate(isoString) {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch (e) { return ''; }
  }

  formatTime(isoString) {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  getFilteredNotes() {
    const query = this.searchQuery.toLowerCase();
    return this.notes
      .filter(n => 
        ((n.title && n.title.toLowerCase()) || '').includes(query) ||
        ((n.content && n.content.toLowerCase()) || '').includes(query)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  render() {
    const root = document.getElementById('root');
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    
    if (this.view === 'list') {
      root.appendChild(this.renderListView());
    } else if (this.view === 'editor') {
      root.appendChild(this.renderEditorView());
    }
  }

  renderListView() {
    const container = document.createElement('div');
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; background: white;';
    
    // Header
    const header = document.createElement('header');
    header.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-bottom: 1px solid #e5e7eb; background: rgba(255,255,255,0.95); position: sticky; top: 0; z-index: 10;';
    
    const headerTop = document.createElement('div');
    headerTop.style.cssText = 'display: flex; align-items: center; justify-content: space-between;';
    
    const title = document.createElement('h1');
    title.style.cssText = 'font-size: 1.125rem; font-weight: bold; color: #1f2937; letter-spacing: -0.01em; margin: 0;';
    title.textContent = 'Minhas Notas';
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; gap: 0.5rem;';
    
    const importBtn = document.createElement('button');
    importBtn.id = 'import-btn';
    this.setSVG(importBtn, ICONS.upload);
    importBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; border-radius: 0.5rem; transition: all 0.2s; color: #9ca3af; display: flex; align-items: center; justify-content: center;';
    importBtn.title = 'Importar arquivo .txt';
    importBtn.onmouseover = () => { importBtn.style.backgroundColor = '#e0e7ff'; importBtn.style.color = '#4f46e5'; };
    importBtn.onmouseout = () => { importBtn.style.backgroundColor = 'transparent'; importBtn.style.color = '#9ca3af'; };
    importBtn.onmousedown = () => importBtn.style.transform = 'scale(0.95)';
    importBtn.onmouseup = () => importBtn.style.transform = 'scale(1)';
    
    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'settings-btn';
    this.setSVG(settingsBtn, ICONS.settings);
    settingsBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; border-radius: 0.5rem; transition: all 0.2s; color: #9ca3af; display: flex; align-items: center; justify-content: center;';
    settingsBtn.title = 'Configurações';
    settingsBtn.onmouseover = () => { settingsBtn.style.backgroundColor = '#f3f4f6'; settingsBtn.style.color = '#4b5563'; };
    settingsBtn.onmouseout = () => { settingsBtn.style.backgroundColor = 'transparent'; settingsBtn.style.color = '#9ca3af'; };
    
    const addNoteBtn = document.createElement('button');
    addNoteBtn.id = 'add-note-btn';
    this.setSVG(addNoteBtn, ICONS.plus);
    addNoteBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; border-radius: 0.5rem; transition: all 0.2s; color: #4f46e5; display: flex; align-items: center; justify-content: center;';
    addNoteBtn.title = 'Nova Nota';
    addNoteBtn.onmouseover = () => { addNoteBtn.style.backgroundColor = '#e0e7ff'; };
    addNoteBtn.onmouseout = () => { addNoteBtn.style.backgroundColor = 'transparent'; };
    addNoteBtn.onmousedown = () => addNoteBtn.style.transform = 'scale(0.95)';
    addNoteBtn.onmouseup = () => addNoteBtn.style.transform = 'scale(1)';
    
    buttonsDiv.appendChild(importBtn);
    buttonsDiv.appendChild(settingsBtn);
    buttonsDiv.appendChild(addNoteBtn);
    
    headerTop.appendChild(title);
    headerTop.appendChild(buttonsDiv);
    header.appendChild(headerTop);
    
    // Search box
    const searchDiv = document.createElement('div');
    searchDiv.style.cssText = 'position: relative;';
    
    const searchInput = document.createElement('input');
    searchInput.id = 'search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Pesquisar...';
    searchInput.value = this.searchQuery;
    searchInput.style.cssText = 'width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; color: #1f2937;';
    searchInput.onfocus = () => { searchInput.style.backgroundColor = '#ffffff'; searchInput.style.boxShadow = '0 0 0 2px #e0e7ff'; searchInput.style.borderColor = '#c7d2fe'; };
    searchInput.onblur = () => { searchInput.style.boxShadow = 'none'; searchInput.style.backgroundColor = '#f3f4f6'; searchInput.style.borderColor = '#e5e7eb'; };
    
    const searchIcon = document.createElement('span');
    searchIcon.style.cssText = 'position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; width: 16px; height: 16px; color: #9ca3af; display: flex; align-items: center;';
    this.setSVG(searchIcon, ICONS.search);
    
    searchDiv.appendChild(searchIcon);
    searchDiv.appendChild(searchInput);
    header.appendChild(searchDiv);
    
    container.appendChild(header);

    // Hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.style.display = 'none';
    fileInput.id = 'file-input';
    container.appendChild(fileInput);

    // Notes list
    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem;';
    
    const filteredNotes = this.getFilteredNotes();
    
    if (filteredNotes.length > 0) {
      filteredNotes.forEach(note => {
        const noteEl = document.createElement('div');
        const colors = NOTE_COLORS[note.colorKey] || NOTE_COLORS.yellow;
        noteEl.style.cssText = `padding: 1rem; background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s;`;
        
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;';
        
        const titleEl = document.createElement('h3');
        titleEl.style.cssText = 'font-weight: bold; font-size: 0.875rem; color: #111827; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 85%; line-height: 1.25;';
        titleEl.textContent = note.title || 'Nova Nota';
        
        const eyeIcon = document.createElement('span');
        eyeIcon.textContent = '•';
        eyeIcon.style.cssText = 'font-size: 20px; opacity: 0; transition: opacity 0.2s; color: #d1d5db;';
        
        titleDiv.appendChild(titleEl);
        titleDiv.appendChild(eyeIcon);
        noteEl.appendChild(titleDiv);
        
        const content = document.createElement('p');
        content.style.cssText = 'font-size: 0.75rem; color: #374151; margin: 0.75rem 0; min-height: 4.5em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; font-weight: 500; opacity: 0.8; line-height: 1.5;';
        content.textContent = note.content || 'Sem conteúdo adicional...';
        noteEl.appendChild(content);
        
        const footer = document.createElement('div');
        footer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid rgba(0,0,0,0.05);';
        
        const category = document.createElement('span');
        category.style.cssText = 'font-size: 0.625rem; font-weight: bold; color: #6b7280; text-transform: uppercase; background: rgba(255,255,255,0.4); padding: 0.375rem 0.75rem; border-radius: 0.25rem; letter-spacing: 0.05em;';
        category.textContent = note.category;
        
        const date = document.createElement('span');
        date.style.cssText = 'font-size: 0.625rem; color: #6b7280; font-weight: 500; font-variant-numeric: tabular-nums;';
        date.textContent = this.formatDate(note.date);
        
        footer.appendChild(category);
        footer.appendChild(date);
        noteEl.appendChild(footer);
        
        noteEl.onmouseover = () => {
          noteEl.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
          eyeIcon.style.opacity = '1';
        };
        noteEl.onmouseout = () => {
          noteEl.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)';
          eyeIcon.style.opacity = '0';
        };
        noteEl.onmousedown = () => noteEl.style.transform = 'scale(0.98)';
        noteEl.onmouseup = () => noteEl.style.transform = 'scale(1)';
        
        noteEl.onclick = () => this.openNote(note.id);
        listContainer.appendChild(noteEl);
      });
    } else {
      const emptyState = document.createElement('div');
      emptyState.style.cssText = 'flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6b7280; padding: 2rem;';
      
      const icon = document.createElement('div');
      icon.style.cssText = 'background: #f3f4f6; padding: 1rem; border-radius: 9999px; margin-bottom: 0.75rem; font-size: 1.5rem; color: #6b7280; display: flex; align-items: center; justify-content: center;';
      this.setSVG(icon, ICONS.search);
      
      const text = document.createElement('p');
      text.style.cssText = 'font-size: 0.95rem; font-weight: 600; margin: 0 0 0.75rem 0; color: #374151;';
      text.textContent = 'Nenhuma nota encontrada';

      const hint = document.createElement('p');
      hint.style.cssText = 'font-size: 0.825rem; color: #6b7280; margin: 0 0 1rem 0;';
      hint.textContent = 'Crie a sua primeira nota clicando em Novo';

      const createBtn = document.createElement('button');
      createBtn.id = 'empty-add-btn';
      this.setSVG(createBtn, ICONS.plus);
      const btnText = document.createElement('span');
      btnText.textContent = '  Nova nota';
      createBtn.appendChild(btnText);
      createBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: #4f46e5; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: bold;';
      createBtn.onmouseover = () => createBtn.style.backgroundColor = '#4338ca';
      createBtn.onmouseout = () => createBtn.style.backgroundColor = '#4f46e5';

      emptyState.appendChild(icon);
      emptyState.appendChild(text);
      emptyState.appendChild(hint);
      emptyState.appendChild(createBtn);
      listContainer.appendChild(emptyState);
    }

    container.appendChild(listContainer);

    // Toast notification
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 0.5rem 1rem; border-radius: 9999px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); z-index: 50; opacity: 0; transition: opacity 0.3s; white-space: nowrap; font-size: 0.75rem; font-weight: bold;';
    toast.textContent = '✓ Copiado!';
    container.appendChild(toast);
    
    return container;
  }

  renderEditorView() {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return document.createElement('div');

    const colors = NOTE_COLORS[note.colorKey] || NOTE_COLORS.yellow;
    const container = document.createElement('div');
    container.style.cssText = `width: 100%; height: 100%; display: flex; flex-direction: column; background: ${colors.bg};`;
    
    // Header
    const header = document.createElement('header');
    header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.05); background: rgba(255,255,255,0.6); position: sticky; top: 0; z-index: 40; height: 56px;';
    
    const backBtn = document.createElement('button');
    backBtn.id = 'back-btn';
    this.setSVG(backBtn, ICONS.back);
    backBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; color: #374151; margin-left: -0.25rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center;';
    backBtn.title = 'Voltar';
    backBtn.onmouseover = () => { backBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; };
    backBtn.onmouseout = () => { backBtn.style.backgroundColor = 'transparent'; };
    backBtn.onmousedown = () => backBtn.style.transform = 'scale(0.95)';
    backBtn.onmouseup = () => backBtn.style.transform = 'scale(1)';
    header.appendChild(backBtn);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';
    
    // Font size controls
    const fontDiv = document.createElement('div');
    fontDiv.style.cssText = 'display: flex; align-items: center; background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.05); border-radius: 0.5rem; padding: 0.25rem; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); margin-right: 0.5rem; height: 32px;';
    
    const decreaseBtn = document.createElement('button');
    decreaseBtn.id = 'font-decrease';
    decreaseBtn.textContent = 'A-';
    decreaseBtn.style.cssText = 'width: 28px; height: 32px; border: none; background: none; cursor: pointer; font-size: 0.625rem; font-weight: bold; color: #4b5563; transition: all 0.2s;';
    decreaseBtn.onmouseover = () => { decreaseBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; decreaseBtn.style.color = '#000'; };
    decreaseBtn.onmouseout = () => { decreaseBtn.style.backgroundColor = 'transparent'; decreaseBtn.style.color = '#4b5563'; };
    decreaseBtn.onmousedown = () => decreaseBtn.style.transform = 'scale(0.95)';
    decreaseBtn.onmouseup = () => decreaseBtn.style.transform = 'scale(1)';
    
    const divider = document.createElement('div');
    divider.style.cssText = 'width: 1px; height: 12px; background: rgba(0,0,0,0.1);';
    
    const increaseBtn = document.createElement('button');
    increaseBtn.id = 'font-increase';
    increaseBtn.textContent = 'A+';
    increaseBtn.style.cssText = 'width: 28px; height: 32px; border: none; background: none; cursor: pointer; font-size: 0.75rem; font-weight: bold; color: #4b5563; transition: all 0.2s;';
    increaseBtn.onmouseover = () => { increaseBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; increaseBtn.style.color = '#000'; };
    increaseBtn.onmouseout = () => { increaseBtn.style.backgroundColor = 'transparent'; increaseBtn.style.color = '#4b5563'; };
    increaseBtn.onmousedown = () => increaseBtn.style.transform = 'scale(0.95)';
    increaseBtn.onmouseup = () => increaseBtn.style.transform = 'scale(1)';
    
    fontDiv.appendChild(decreaseBtn);
    fontDiv.appendChild(divider);
    fontDiv.appendChild(increaseBtn);
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.id = 'edit-btn';
    editBtn.style.cssText = `padding: 0.5rem 0.75rem; border: ${this.isEditing ? 'none' : '1px solid rgba(0,0,0,0.05)'}; background: ${this.isEditing ? '#1f2937' : 'white'}; color: ${this.isEditing ? 'white' : '#374151'}; border-radius: 0.5rem; cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: all 0.2s; box-shadow: ${this.isEditing ? 'none' : '0 1px 2px 0 rgba(0,0,0,0.05)'}; display: flex; align-items: center; gap: 0.375rem;`;
    this.setSVG(editBtn, this.isEditing ? ICONS.save : ICONS.edit);
    const editText = document.createElement('span');
    editText.textContent = this.isEditing ? ' Salvar' : ' Editar';
    editBtn.appendChild(editText);
    editBtn.onmouseover = () => { 
      if (!this.isEditing) editBtn.style.backgroundColor = 'rgba(255,255,255,0.8)';
    };
    editBtn.onmouseout = () => { 
      if (!this.isEditing) editBtn.style.backgroundColor = 'white';
    };
    editBtn.onmousedown = () => editBtn.style.transform = 'scale(0.95)';
    editBtn.onmouseup = () => editBtn.style.transform = 'scale(1)';
    
    buttonsContainer.appendChild(fontDiv);
    buttonsContainer.appendChild(editBtn);
    
    // Divider
    const divider2 = document.createElement('div');
    divider2.style.cssText = 'width: 1px; height: 16px; background: rgba(0,0,0,0.1);';
    buttonsContainer.appendChild(divider2);
    
    // Color picker button
    const colorBtn = document.createElement('button');
    colorBtn.id = 'color-btn';
    this.setSVG(colorBtn, ICONS.palette);
    colorBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; transition: all 0.2s; color: #4b5563; display: flex; align-items: center; justify-content: center; position: relative;';
    colorBtn.title = 'Mudar cor da nota';
    colorBtn.onmouseover = () => { colorBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; };
    colorBtn.onmouseout = () => { colorBtn.style.backgroundColor = 'transparent'; };
    colorBtn.onmousedown = () => colorBtn.style.transform = 'scale(0.95)';
    colorBtn.onmouseup = () => colorBtn.style.transform = 'scale(1)';
    
    // Color picker dropdown (hidden by default)
    const colorDropdown = document.createElement('div');
    colorDropdown.id = 'color-dropdown';
    colorDropdown.style.cssText = 'position: absolute; top: calc(100% + 0.5rem); right: -1rem; background: white; border: 1px solid rgba(0,0,0,0.1); border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 100; padding: 0.5rem; display: none; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;';
    colorDropdown.style.display = 'grid';
    colorDropdown.style.visibility = 'hidden';
    colorDropdown.style.opacity = '0';
    colorDropdown.style.transition = 'all 0.2s';
    
    Object.entries(NOTE_COLORS).forEach(([key, color]) => {
      const colorOption = document.createElement('button');
      colorOption.className = 'color-option';
      colorOption.dataset.color = key;
      colorOption.style.cssText = `width: 32px; height: 32px; border: ${note.colorKey === key ? '2px solid #1f2937' : '1px solid rgba(0,0,0,0.1)'}; background: ${color.bg}; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; padding: 0;`;
      colorOption.title = color.name;
      colorOption.onmouseover = () => { colorOption.style.transform = 'scale(1.1)'; };
      colorOption.onmouseout = () => { colorOption.style.transform = 'scale(1)'; };
      colorDropdown.appendChild(colorOption);
    });
    
    colorBtn.appendChild(colorDropdown);
    
    buttonsContainer.appendChild(colorBtn);
    
    // Divider 3
    const divider3 = document.createElement('div');
    divider3.style.cssText = 'width: 1px; height: 16px; background: rgba(0,0,0,0.1);';
    buttonsContainer.appendChild(divider3);
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-btn';
    this.setSVG(exportBtn, ICONS.download);
    exportBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; transition: all 0.2s; color: #4b5563; display: flex; align-items: center; justify-content: center;';
    exportBtn.title = 'Exportar como .txt';
    exportBtn.onmouseover = () => { exportBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; exportBtn.style.color = '#4f46e5'; };
    exportBtn.onmouseout = () => { exportBtn.style.backgroundColor = 'transparent'; exportBtn.style.color = '#4b5563'; };
    exportBtn.onmousedown = () => exportBtn.style.transform = 'scale(0.95)';
    exportBtn.onmouseup = () => exportBtn.style.transform = 'scale(1)';
    
    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.id = 'copy-btn';
    this.setSVG(copyBtn, ICONS.copy);
    copyBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; transition: all 0.2s; color: #4b5563; display: flex; align-items: center; justify-content: center;';
    copyBtn.title = 'Copiar texto';
    copyBtn.onmouseover = () => { copyBtn.style.backgroundColor = 'rgba(0,0,0,0.05)'; };
    copyBtn.onmouseout = () => { copyBtn.style.backgroundColor = 'transparent'; };
    copyBtn.onmousedown = () => copyBtn.style.transform = 'scale(0.95)';
    copyBtn.onmouseup = () => copyBtn.style.transform = 'scale(1)';
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.id = 'delete-btn';
    this.setSVG(deleteBtn, ICONS.delete);
    deleteBtn.style.cssText = 'padding: 0.5rem; background: none; border: none; cursor: pointer; color: #4b5563; transition: all 0.2s; display: flex; align-items: center; justify-content: center;';
    deleteBtn.title = 'Excluir nota';
    deleteBtn.onmouseover = () => { deleteBtn.style.backgroundColor = '#fee2e2'; deleteBtn.style.color = '#dc2626'; };
    deleteBtn.onmouseout = () => { deleteBtn.style.backgroundColor = 'transparent'; deleteBtn.style.color = '#4b5563'; };
    deleteBtn.onmousedown = () => deleteBtn.style.transform = 'scale(0.95)';
    deleteBtn.onmouseup = () => deleteBtn.style.transform = 'scale(1)';
    
    buttonsContainer.appendChild(exportBtn);
    buttonsContainer.appendChild(copyBtn);
    buttonsContainer.appendChild(deleteBtn);
    
    header.appendChild(buttonsContainer);
    container.appendChild(header);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.style.cssText = 'flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column;';
    
    // Category selector
    const categoryDiv = document.createElement('div');
    categoryDiv.style.cssText = 'margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.style.cssText = 'font-size: 0.75rem; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;';
    categoryLabel.textContent = 'Categoria:';
    
    const categoryInput = document.createElement('input');
    categoryInput.id = 'category-input';
    categoryInput.type = 'text';
    categoryInput.value = note.category || 'Geral';
    categoryInput.placeholder = 'Digite a categoria';
    categoryInput.style.cssText = 'flex: 1; padding: 0.375rem 0.5rem; font-size: 0.75rem; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.1); border-radius: 0.375rem; font-weight: 500; color: #4b5563; transition: all 0.2s;';
    categoryInput.onfocus = () => { categoryInput.style.backgroundColor = 'rgba(255,255,255,0.8)'; categoryInput.style.borderColor = '#c7d2fe'; };
    categoryInput.onblur = () => { categoryInput.style.backgroundColor = 'rgba(255,255,255,0.5)'; categoryInput.style.borderColor = 'rgba(0,0,0,0.1)'; };
    
    categoryDiv.appendChild(categoryLabel);
    categoryDiv.appendChild(categoryInput);
    contentArea.appendChild(categoryDiv);
    
    // Title
    if (this.isEditing) {
      const titleInput = document.createElement('input');
      titleInput.id = 'title-input';
      titleInput.type = 'text';
      titleInput.value = note.title;
      titleInput.placeholder = 'Título da Nota';
      titleInput.style.cssText = 'font-size: 1.5rem; font-weight: bold; color: #111827; border: none; outline: none; background: transparent; padding: 0; margin-bottom: 1rem; width: 100%; letter-spacing: -0.02em;';
      titleInput.autofocus = true;
      contentArea.appendChild(titleInput);
    } else {
      const titleText = document.createElement('h1');
      titleText.style.cssText = 'font-size: 1.5rem; font-weight: bold; color: #111827; margin: 0 0 1.5rem 0; word-break: break-word; line-height: 1.25; letter-spacing: -0.02em;';
      titleText.textContent = note.title || 'Sem título';
      contentArea.appendChild(titleText);
    }

    // Content
    if (this.isEditing) {
      const textarea = document.createElement('textarea');
      textarea.id = 'content-textarea';
      textarea.value = note.content;
      textarea.placeholder = 'Comece a digitar suas ideias...';
      textarea.style.cssText = `font-size: ${this.fontSize}px; line-height: 1.6; flex: 1; border: none; outline: none; resize: none; background: transparent; padding: 0; color: #1f2937; font-family: inherit; font-weight: 500;`;
      contentArea.appendChild(textarea);
    } else {
      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `font-size: ${this.fontSize}px; line-height: 1.6; flex: 1; color: #1f2937; white-space: pre-wrap; word-break: break-word; font-weight: 500;`;
      contentDiv.textContent = note.content || 'Toque em editar para adicionar conteúdo...';
      contentArea.appendChild(contentDiv);
    }

    container.appendChild(contentArea);

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'padding: 0.5rem 1rem; font-size: 0.625rem; color: #6b7280; font-weight: 500; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.4); border-top: 1px solid rgba(0,0,0,0.05);';
    
    const leftSide = document.createElement('span');
    leftSide.style.cssText = 'display: flex; align-items: center; gap: 0.375rem;';
    
    if (this.isEditing) {
      const editingText = document.createElement('span');
      editingText.style.cssText = 'color: #4f46e5; font-weight: bold;';
      editingText.textContent = 'Editando...';
      leftSide.appendChild(editingText);
    } else {
      leftSide.textContent = `Salvo às ${this.formatTime(note.date)}`;
    }
    
    const rightSide = document.createElement('span');
    rightSide.style.cssText = 'font-variant-numeric: tabular-nums; opacity: 0.6;';
    rightSide.textContent = `${note.content.length} caracteres`;
    
    footer.appendChild(leftSide);
    footer.appendChild(rightSide);
    container.appendChild(footer);

    return container;
  }

  attachEventListeners() {
    if (this.view === 'list') {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.oninput = (e) => {
          this.searchQuery = e.target.value;
          this.render();
          this.attachEventListeners();
        };
      }

      const addNoteBtn = document.getElementById('add-note-btn');
      if (addNoteBtn) {
        addNoteBtn.onclick = (e) => {
          e.preventDefault();
          this.addNote();
        };
      }

      const emptyAddBtn = document.getElementById('empty-add-btn');
      if (emptyAddBtn) {
        emptyAddBtn.onclick = (e) => {
          e.preventDefault();
          this.addNote();
        };
      }
      const importBtn = document.getElementById('import-btn');
      if (importBtn) {
        importBtn.onclick = (e) => {
          e.preventDefault();
          document.getElementById('file-input').click();
        };
      }

      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            this.importFile(file);
          }
          e.target.value = '';
        };
      }

      const settingsBtn = document.getElementById('settings-btn');
      if (settingsBtn) {
        settingsBtn.onclick = (e) => {
          e.preventDefault();
          this.showSettingsModal();
        };
      }
    } else if (this.view === 'editor') {
      const backBtn = document.getElementById('back-btn');
      if (backBtn) {
        backBtn.onclick = (e) => {
          e.preventDefault();
          this.closeNote();
        };
      }

      const editBtn = document.getElementById('edit-btn');
      if (editBtn) {
        editBtn.onclick = (e) => {
          e.preventDefault();
          this.toggleEditMode();
        };
      }

      const fontDecreaseBtn = document.getElementById('font-decrease');
      if (fontDecreaseBtn) {
        fontDecreaseBtn.onclick = (e) => {
          e.preventDefault();
          this.changeFontSize(-2);
        };
      }

      const fontIncreaseBtn = document.getElementById('font-increase');
      if (fontIncreaseBtn) {
        fontIncreaseBtn.onclick = (e) => {
          e.preventDefault();
          this.changeFontSize(2);
        };
      }

      const copyBtn = document.getElementById('copy-btn');
      if (copyBtn) {
        copyBtn.onclick = (e) => {
          e.preventDefault();
          this.copyToClipboard();
        };
      }

      const colorBtn = document.getElementById('color-btn');
      if (colorBtn) {
        const colorDropdown = document.getElementById('color-dropdown');
        colorBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          colorDropdown.style.visibility = colorDropdown.style.visibility === 'visible' ? 'hidden' : 'visible';
          colorDropdown.style.opacity = colorDropdown.style.opacity === '1' ? '0' : '1';
        };
      }

      const colorOptions = document.querySelectorAll('.color-option');
      colorOptions.forEach(option => {
        option.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const colorKey = option.dataset.color;
          this.updateNoteColor(this.activeNoteId, colorKey);
          this.render();
          this.attachEventListeners();
        };
      });

      // Close color dropdown when clicking outside
      document.addEventListener('click', (e) => {
        const colorDropdown = document.getElementById('color-dropdown');
        if (colorDropdown && !e.target.closest('#color-btn')) {
          colorDropdown.style.visibility = 'hidden';
          colorDropdown.style.opacity = '0';
        }
      });

      const exportBtn = document.getElementById('export-btn');
      if (exportBtn) {
        exportBtn.onclick = (e) => {
          e.preventDefault();
          this.exportNote();
        };
      }

      const deleteBtn = document.getElementById('delete-btn');
      if (deleteBtn) {
        deleteBtn.onclick = (e) => {
          e.preventDefault();
          this.deleteNote(this.activeNoteId);
        };
      }

      const titleInput = document.getElementById('title-input');
      if (titleInput) {
        titleInput.oninput = (e) => {
          this.updateNote(this.activeNoteId, 'title', e.target.value);
        };
      }

      const contentTextarea = document.getElementById('content-textarea');
      if (contentTextarea) {
        contentTextarea.oninput = (e) => {
          this.updateNote(this.activeNoteId, 'content', e.target.value);
        };
      }

      const categoryInput = document.getElementById('category-input');
      if (categoryInput) {
        categoryInput.oninput = (e) => {
          this.updateNote(this.activeNoteId, 'category', e.target.value);
        };
      }
    }
  }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new NotesApp();
});
