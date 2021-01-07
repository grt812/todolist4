function injectNewTab(tab){
  console.log(tab.pendingUrl);
  // console.log(tab.url);
  if(tab.pendingUrl === "chrome://newtab/"){
    chrome.tabs.executeScript(tab.id, {file: "content.js"});
  }
}

chrome.tabs.onCreated.addListener(injectNewTab);
chrome.tabs.onUpdated.addListener(function(tab){
  if(tab.status === "loading"){
    injectNewTab();
  }
});
