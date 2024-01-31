import { KNOWN_EXCHANGES } from "@/lib/exchangeBalance";

console.log('background is running')

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

  chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);

    const currentExchange = KNOWN_EXCHANGES.find((exchange) => url.hostname.includes(exchange.url));

    console.log('currentExchange', currentExchange)

    if (currentExchange) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true
      });
    } else {
      // Disables the side panel on all other sites
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
    }
  });

