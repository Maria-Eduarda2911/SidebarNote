# SidebarNote - Documentação do Código-Fonte

Este documento fornece instruções para a revisão e empacotamento da extensão **SidebarNote**.

## Demonstração e Instalação

O vídeo abaixo demonstra a aplicação em funcionamento e explica como adicioná-la ao Chrome:

<video src="demo.mp4" controls width="100%"></video>

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

## Instruções de Instalação e Compilação

Como o código não requer transpilação, o processo de "compilação" consiste apenas em empacotar os arquivos em um arquivo `.zip` ou `.xpi`.

### Método 1: Usando NPM e web-ext (Recomendado)

1. Certifique-se de ter o Node.js instalado.
2. Abra o terminal na raiz do projeto.
3. Execute o comando de build:

   ```bash
   npm run build
   ```

   *Este comando executará `npx web-ext build`, que validará o manifesto e gerará o arquivo `.zip` na pasta `web-ext-artifacts/`.*

### Método 2: Empacotamento Manual

Caso não deseje usar Node.js, você pode criar o pacote manualmente:

1. Selecione os seguintes arquivos e pastas:
   - `manifest.json`
   - `sidebar.html`
   - `app.js`
   - `background.js`
   - `icons/`
2. Crie um arquivo ZIP contendo esses arquivos (certifique-se de que o `manifest.json` esteja na raiz do ZIP, e não dentro de uma subpasta).
3. O arquivo ZIP resultante é o pacote final pronto para instalação ou submissão.
