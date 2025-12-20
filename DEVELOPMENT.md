# Instruções de Desenvolvimento

## Setup

1. Certifique-se de que tem Firefox instalado
2. Clone ou baixe este repositório
3. Abra Firefox e navegue até `about:debugging#/runtime/this-firefox`
4. Clique em "Carregar complemento temporário"
5. Selecione o arquivo `manifest.json` desta pasta

## Estrutura de arquivos importante

- `manifest.json` - Configuração da extensão Firefox
- `sidebar.html` - Página HTML que será exibida na sidebar
- `app.js` - Componente React principal (compilado com React.createElement)
- `background.js` - Script de background (suporte da extensão)
- `icons/` - Ícones da extensão em diferentes tamanhos

## Mudanças no código original

O código React original foi convertido de JSX para `React.createElement()` para ser compatível com carregamento via CDN:

### Antes (JSX):
```jsx
<div className="flex items-center">
  <Plus size={24} />
</div>
```

### Depois (React.createElement):
```javascript
React.createElement(
  'div',
  { className: 'flex items-center' },
  React.createElement('span', null, '➕')
)
```

## Testando alterações

1. Faça suas alterações nos arquivos
2. No Firefox, vá até `about:debugging#/runtime/this-firefox`
3. Clique em "Recarregar" próximo à sua extensão
4. A sidebar será atualizada com suas mudanças

## Usando ícones lucide-react

Se você quiser usar os ícones originais do lucide-react, terá que:

1. Usar um bundler como Webpack ou Parcel
2. Ou substituir os ícones por SVGs inline ou URLs

Atualmente, a extensão usa emojis para simplificar a compatibilidade.

## Tamanho da sidebar

A sidebar padrão tem 400px de largura. Para alterar:
- Edite `body { width: 400px; }` em `sidebar.html`

## Debug

Para ver logs de console da extensão:
1. Vá até `about:debugging#/runtime/this-firefox`
2. Clique em "Inspetor" na sua extensão
3. Abra a aba "Console"

## Build para distribuição

Para criar um arquivo .xpi (instalável):
1. Comprima todos os arquivos em um ZIP
2. Renomeie para `.xpi`
3. Ou submeta diretamente à Mozilla Add-ons Store

Certifique-se de incluir:
- manifest.json
- sidebar.html
- app.js
- background.js
- icons/ (todos os ícones)
- README.md
