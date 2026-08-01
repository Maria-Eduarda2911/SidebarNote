/**
 * Service Worker (Manifest V3) — SidebarNote
 *
 * Responsabilidades:
 *  - Configurar comportamento do sidePanel (abrir ao clicar no ícone)
 *  - Logs básicos (instalação/atualização)
 *
 * NOTA: Nenhuma permissão extra é solicitada. Mantemos o mínimo possível
 * para conformidade com revisão Chrome Web Store e Firefox Add-ons.
 */

const LOG_PREFIX = '[SidebarNote]';

/**
 * Configura sidePanel para abrir automaticamente quando o usuário
 * clicar no ícone da extensão (barra de ferramentas).
 *
 * sidePanel.setPanelBehavior requer Chrome 116+ / Firefox compatível.
 */
async function configureSidePanel() {
  try {
    if (globalThis.chrome?.sidePanel?.setPanelBehavior) {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      console.debug(`${LOG_PREFIX} sidePanel configurado (openPanelOnActionClick = true)`);
    }
  } catch (err) {
    console.warn(`${LOG_PREFIX} Falha ao configurar sidePanel:`, err?.message || err);
  }
}

/**
 * Handler de instalação / atualização da extensão.
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  const { reason, previousVersion } = details || {};

  await configureSidePanel();

  switch (reason) {
    case 'install':
      console.info(`${LOG_PREFIX} Instalado com sucesso. Bem-vindo(a)! 🎉`);
      break;
    case 'update':
      console.info(
        `${LOG_PREFIX} Atualizado para v${chrome.runtime.getManifest?.().version ?? '?'} (anterior: ${previousVersion ?? '?'})`,
      );
      break;
    case 'chrome_update':
    case 'shared_module_update':
    default:
      console.debug(`${LOG_PREFIX} Runtime inicializado.`);
      break;
  }
});

/**
 * Fallback: tenta configurar o painel também quando o service worker
 * acordar, caso `onInstalled` não tenha sido suficiente.
 */
chrome.runtime.onStartup?.addListener?.(() => {
  configureSidePanel();
});
