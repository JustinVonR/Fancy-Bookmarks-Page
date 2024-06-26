browser.browserAction.onClicked.addListener(() => {
    let creating = browser.tabs.create({
      url: "Bookmarks Page/index.html",
    });

    function onCreated() {
      console.log("Created Bookmarks Page");
    }

    function onError(error) {
      console.log(`Error while opening bookmark page: ${error}`);
    }

    creating.then(onCreated, onError);
  });

console.log("running background script");

function setDefaults(settings) {
  if (typeof settings.theme === 'undefined' || typeof settings.accent === 'undefined' || typeof settings.bgColor === 'undefined') {
    console.log("setting up default settings");
    browser.storage.sync.set({
      theme: "DARK",
      accent: "#3584e4",
      bgColor: "#16002b",
      accentHover: "#4D3CC9",
      startLocation: "toolbar",
    });
  }
}

function onError(error) {
  console.log(`Error while getting settings: ${error}`);
}

let getSettings = browser.storage.sync.get();
getSettings.then(setDefaults, onError);
