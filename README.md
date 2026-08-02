# 📝 SidebarNote

[![Mozilla Add-on Version](https://img.shields.io/amo/v/sidebarnote?style=flat-square&logo=firefox-browser&color=orange)](https://addons.mozilla.org/en-US/firefox/addon/sidebarnote/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square&logo=webextensions)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)

**SidebarNote** é uma extensão de anotações em barra lateral para navegadores que permite criar, organizar, buscar e exportar notas rapidamente sem sair da página atual.

---

## 🎥 Demonstração em Vídeo

Assista ao vídeo abaixo para ver o funcionamento da extensão e conferir a experiência completa na barra lateral:

[![Demonstração SidebarNote](https://img.youtube.com/vi/Cush8-91tUM/0.jpg)](https://youtu.be/Cush8-91tUM)

---

## 🦊 Instalação via Firefox Add-ons

A extensão está disponível para o Mozilla Firefox na loja oficial:

👉 [Instalar SidebarNote no Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/sidebarnote/)

---

## ✨ Recursos principais

- Criação, edição e exclusão de notas em uma barra lateral.
- Busca por texto, título, categoria e conteúdo.
- Cores personalizadas para organizar visualmente as notas.
- Categorias, exportação/importação de arquivos .txt e ajuste de tamanho de fonte.
- Armazenamento local com persistência automática.

---

## 🛠️ Visão geral técnica

A extensão foi desenvolvida com base em WebExtensions seguindo o padrão **Manifest V3**, com foco em simplicidade, revisão transparente e compatibilidade com navegadores modernos:

- **Linguagens**: JavaScript vanilla (ES6+), HTML5 e CSS.
- **Arquitetura**: estrutura modular sem bundlers ou frameworks pesados.
- **Persistência**: abstração de armazenamento em [src/utils/storage.js](src/utils/storage.js) com suporte a `chrome.storage.local` e fallback para `localStorage`.
- **Interface**: renderização da UI com componentes e views em [src/ui/render/views.js](src/ui/render/views.js) e [src/ui/components/ToastModal.js](src/ui/components/ToastModal.js).
- **Estado e regras de negócio**: concentrados em [src/core/NotesApp.js](src/core/NotesApp.js).
- **Service worker**: comportamento do painel lateral controlado por [background.js](background.js).

---

## 💻 Requisitos e empacotamento

### Navegadores suportados

- Mozilla Firefox
- Google Chrome
- Microsoft Edge
- Brave e navegadores baseados em Chromium

### Ferramentas opcionais para testes e empacotamento

- Node.js 14+ 
- npm 6+

### Exemplo com web-ext

```bash
npm install --global web-ext
web-ext run
web-ext build
```

---

## 📁 Estrutura de arquivos

```text
SidebarNote/
├── icons/                        # Ícones da extensão
├── src/
│   ├── core/                     # Lógica principal do aplicativo
│   ├── styles/                   # Estilos CSS da interface
│   ├── ui/
│   │   ├── components/           # Componentes visuais e modais
│   │   └── render/               # Renderização das views
│   └── utils/                    # Helpers, constantes e armazenamento
├── app.js                         # Ponto de entrada da aplicação
├── background.js                  # Service Worker (Manifest V3)
├── manifest.json                  # Manifesto da extensão
├── sidebar.html                   # HTML do painel lateral
├── package.json                   # Scripts de desenvolvimento
└── README.md                      # Documentação do projeto
```

---

## 🔒 Privacidade

Todas as notas são armazenadas localmente no navegador. A extensão não coleta, transmite ou compartilha dados com servidores externos, e usa permissões mínimas para funcionar corretamente.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT.

---

## 🧩 Prompt de otimização ajustado à arquitetura real

```markdown
# Prompt de Refatoração e Otimização - SidebarNote

Atue como um desenvolvedor sênior especializado em extensões WebExtension (Manifest V3) em Vanilla JavaScript.

## Contexto
O projeto SidebarNote é uma extensão de barra lateral com interface em HTML/CSS/JS, usando um service worker em background.js, um manifesto Manifest V3 e uma estrutura modular em src/. O objetivo é melhorar legibilidade, performance e manutenção sem quebrar o comportamento atual.

## Diretrizes de otimização

1. **Otimização de eventos e DOM**
   - Em app.js e src/ui/render/views.js, prefira event delegation no elemento pai da lista em vez de adicionar listeners repetidos a cada nota.
   - Evite re-renderizar a lista inteira quando apenas uma nota for alterada ou criada.

2. **Persistência e escrita em storage**
   - Aplique debounce de 300ms a 500ms nas gravações automáticas de notas e configurações para reduzir I/O e evitar reprocessamento excessivo durante digitação rápida.
   - Preserve a camada de abstração em src/utils/storage.js para manter compatibilidade com chrome.storage.local e fallback para localStorage.

3. **Arquitetura e clean code**
   - Mantenha a estrutura modular atual sem introduzir frameworks pesados como React, Vue ou Webpack.
   - Elimine duplicidades entre utilidades de src/utils, src/core/NotesApp.js e os módulos de UI.
   - Mantenha o background.js enxuto e sem lógica de negócio pesada.

4. **Garantia de regressão**
   - Preserve as APIs públicas e o fluxo de criação, edição, exclusão, busca, exportação/importação, troca de cores e salvamento automático.
   - Não altere o comportamento esperado da interface nem a compatibilidade com Firefox/Chrome/Edge.

5. **Revisão de publicação**
   - Evite incluir mídias pesadas ou artefatos desnecessários no pacote final da extensão.
   - Mantenha permissões mínimas e siga práticas de segurança e revisão de lojas.

## Entregáveis esperados
- Código mais limpo, modular e mais fácil de manter.
- Melhor performance em interações frequentes, especialmente em digitação e navegação.
- Sem regressões nas funcionalidades principais da extensão.
```