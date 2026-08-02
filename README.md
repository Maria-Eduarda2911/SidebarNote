# 📝 SidebarNote

[![Mozilla Add-on Version](https://img.shields.io/amo/v/sidebarnote?style=flat-square&logo=firefox-browser&color=orange)](https://addons.mozilla.org/en-US/firefox/addon/sidebarnote/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square&logo=webextensions)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)

**SidebarNote** é uma extensão de anotações em barra lateral para navegadores. Ela permite criar, organizar e pesquisar notas rapidamente durante a navegação, sem interromper o seu fluxo de trabalho.

---

## 🎥 Demonstração em Vídeo

Assista ao vídeo abaixo para ver o **SidebarNote** em funcionamento e aprender a adicioná-lo ao seu navegador:

[![Demonstração SidebarNote](https://img.youtube.com/vi/Cush8-91tUM/0.jpg)](https://youtu.be/Cush8-91tUM)

---

## 🦊 Instalação via Firefox Add-ons

A extensão está disponível para o Mozilla Firefox. Você pode instalá-la diretamente através da loja oficial:

👉 [Instalar SidebarNote no Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/sidebarnote/)

---

## 🛠️ Visão Geral Técnica

A extensão foi desenvolvida seguindo os padrões das **WebExtensions (Manifest V3)**, priorizando simplicidade, segurança e alta performance:

- **Linguagens**: Vanilla JavaScript (ES6+), HTML5 e CSS.
- **Transpilação**: Não requer o uso de bundlers (Webpack, Vite) ou frameworks (React, Vue, Angular).
- **Transparência**: O código não é ofuscado nem minificado, facilitando a auditoria e revisão.
- **Manipulação do DOM**: Manipulação direta com APIs nativas do navegador (`document.createElement`, `querySelector`, etc.).

---
## Estrutura de Arquivos
```bash

SidebarNote/
├── icons/                 # Ícones da extensão (16px, 32px, 48px, 96px, 128px)
├── src/
│   ├── core/              # Gerenciamento principal do estado e regras de negócio
│   ├── styles/            # Estilos CSS da interface
│   ├── ui/                # Renderização da interface e componentes
│   └── utils/             # Auxiliares de armazenamento e constantes
├── manifest.json          # Manifesto da extensão (Manifest V3)
├── sidebar.html           # Interface HTML do painel lateral
├── app.js                 # Ponto de entrada da aplicação
├── background.js          # Service Worker de segundo plano
├── package.json           # Dependências de desenvolvimento (web-ext)
└── README.md              # Documentação do projeto
```

## 💻 Requisitos de Sistema e Empacotamento

- **Navegadores suportados**: Mozilla Firefox, Google Chrome, Microsoft Edge, Brave e navegadores baseados em Chromium.
- **Ferramentas de Desenvolvimento** (Opcional, para empacotamento automatizado via `web-ext`):
  - **Node.js**: v14.0.0 ou superior
  - **NPM**: v6.0.0 ou superior

### Empacotando com `web-ext`
Para testar ou empacotar a extensão para publicação:

```bash
# Instalar a ferramenta web-ext globalmente
npm install --global web-ext

# Testar no Firefox em modo desenvolvedor
web-ext run

# Gerar o arquivo .zip para publicação
web-ext build