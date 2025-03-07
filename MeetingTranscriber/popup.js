chrome.windows.create({
  url: chrome.runtime.getURL("transcriber.html"),
  type: "popup",
  width: 400,
  height: 600
}, function() {
  window.close();
});
