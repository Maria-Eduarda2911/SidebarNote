# SidebarNote - Documentação do Código-Fonte

Este documento fornece instruções para a revisão e empacotamento da extensão **SidebarNote**.

## Demonstração e Instalação

🎥 Demonstração da aplicação em funcionamento  
👉 Clique aqui para assistir: [Demo da aplicação](./demo.mp4)

## Visão Geral Técnica

Esta extensão foi desenvolvida utilizando **Vanilla JavaScript (ES6+)**, **HTML5** e **CSS** (injetado via JavaScript).

**Nota para os Revisores (AMO):**
- O código-fonte fornecido é o código original.
- **Não** há uso de frameworks que requerem compilação (como React, Vue, Angular).
- **Não** há uso de pré-processadores CSS (Sass, Less).
- **Não** há ofuscação ou minificação do código.
- O arquivo `app.js` manipula o DOM diretamente usando `document.createElement` e APIs padrão do navegador.

## Requisitos de Sistema e Ambiente

- **Sistema Operacional:** Windows, macOS ou Linux.
- **Node.js e NPM:** Necessários apenas para executar o script de empacotamento automatizado (`web-ext`).
  - Versão recomendada do Node.js: v14.0.0 ou superior.
  - Versão recomendada do NPM: v6.0.0 ou superior.

## Estrutura de Arquivos

- `manifest.json`: Arquivo de manifesto da WebExtension (Manifest V3).
- `sidebar.html`: Ponto de entrada da interface da barra lateral.
- `app.js`: Lógica principal da aplicação (Classes, Estado, Manipulação de DOM).
- `background.js`: Script de background (Service Worker/Event Page).
- `icons/`: Diretório contendo os ícones da extensão.


