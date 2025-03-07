async function ensureOffscreenDocument() {
    if (await chrome.offscreen.hasDocument()) {
      return;
    }
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["WEB_RTC"],
      justification: "Run speech recognition continuously even when the popup is not visible."
    });
  }
  
  chrome.runtime.onInstalled.addListener(() => {
    ensureOffscreenDocument();
  });
  
  // Optionally, handle messaging here if needed.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // For this example, we’re just letting messages flow between the popup and offscreen document.
  });
  