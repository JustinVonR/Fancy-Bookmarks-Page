browser.browserAction.onClicked.addListener(() => {
    let creating = browser.tabs.create({
      url: "Bookmarks Page/index.html",
    });
    creating.then(onCreated, onError);
  });