//Create browser action button to open bookmark viewer
browser.browserAction.onClicked.addListener(() => {
    let creating = browser.tabs.create({
      url: "Bookmarks Page/index.html",
    });

    function onCreated() {
    }

    function onError(error) {
      console.log(`Error while opening bookmark page: ${error}`);
    }

    creating.then(onCreated, onError);
  });

//Set default settings in sync storage if they have not yet been set so that the page doesn't appear plain when first loaded.
function setDefaults(settings) {
  if (typeof settings.theme === 'undefined' || typeof settings.accent === 'undefined' || typeof settings.bgColor === 'undefined') {
    browser.storage.sync.set({
      theme: "DARK",
      accent: "#3584e4",
      bgColor: "#16002b",
      accentHover: "#4D3CC9",
      startLocation: "toolbar",
      openIn: "new",
      replaceNewTab: true,
    });
  }
}


function onError(error) {
  console.log(`Error while getting settings: ${error}`);
}

let getSettings = browser.storage.sync.get();
getSettings.then(setDefaults, onError);

/*
async function onTabCreation(tab) {
  console.log("function called");
  let setting = await browser.storage.sync.get(["replaceNewTab"])
  if ((tab.url == "about:newtab" || tab.url == "about:blank") && setting.replaceNewTab) {
    browser.tabs.update(
      tab.id,
      { url: "https://youtube.com" }
    );
  }
}

const tabFilter = {
  properties: ["url"],
};

browser.tabs.onUpdated.addListener(onTabCreation);
*/