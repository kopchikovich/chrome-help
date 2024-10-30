chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openChromeUrl' && request.url) {
    chrome.tabs.create({ url: request.url })
  }
})
