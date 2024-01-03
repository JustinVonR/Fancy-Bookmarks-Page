let settings=browser.storage.sync.get({
    theme: "DARK",
    accent: "#ce35ce",
    bgType: "COLOR",
    bgFile: "No File Selected",
    bgColor: "#000000"
});
settings.then(onGotSettings, onError);

function onGotSettings() {
    
}

function onError(error) {
    console.log(error);
}


function handleThemeChange(themeRadio) {
    browser.storage.sync.set(settings);
}