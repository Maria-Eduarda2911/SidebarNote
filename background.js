// Background script para a extensão Chrome
// Este arquivo é necessário para a extensão funcionar corretamente

console.log('SidebarNote - Background script carregado');

// Listeners para eventos da extensão (se necessário adicionar no futuro)
chrome.runtime.onInstalled.addListener(() => {
  console.log('SidebarNote foi instalado');
  // Configura o painel lateral para abrir ao clicar no ícone da extensão
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
