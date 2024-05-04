function onError(error) {
    console.log(error);
}

function restoreSettings(settings) {
    function setChoices(result) {
        console.log(result);
        let theme = result.theme;
        document.querySelector(`#${theme}`).checked = true;
        document.querySelector("#accentColorPicker").value = result.accent;
        document.querySelector("#bgColorPicker").value = result.bgColor;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getSettings = browser.storage.sync.get();
    getSettings.then(setChoices, onError);
}

function getTheme() {
    console.log(document.querySelector("#DARK"));
    if ( document.querySelector("#DARK").checked ) {
        console.log("Returning DARK");
        return "DARK";
    } else {
        console.log("Returning LIGHT");
        return "LIGHT";
    }
}

function handleSettingsChange(event) {
    event.preventDefault();
    browser.storage.sync.set({
        theme: getTheme(),
        accent: document.querySelector("#accentColorPicker").value,
        bgColor: document.querySelector("#bgColorPicker").value,
    });
    console.log("Saving Settings.");
}

document.querySelector("form").addEventListener("submit", handleSettingsChange);
document.addEventListener("DOMContentLoaded", restoreSettings);