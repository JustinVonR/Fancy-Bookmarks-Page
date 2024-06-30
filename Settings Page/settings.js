//Fill in previously saved settings for fields
function restoreSettings(settings) {
    function setChoices(result) {
        console.log(result);
        let theme = result.theme;
        document.querySelector(`#${theme}`).checked = true;
        document.querySelector("#accentColorPicker").value = result.accent;
        document.querySelector("#bgColorPicker").value = result.bgColor;
        document.querySelector("#accentHoverColorPicker").value = result.accentHover;
        document.querySelector("#location").value = result.startLocation;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getSettings = browser.storage.sync.get();
    getSettings.then(setChoices, onError);
}

//Return which theme value to use based on the selected radio button
function getTheme() {
    console.log(document.querySelector("#DARK"));
    if ( document.querySelector("#DARK").checked ) {
        return "DARK";
    } else {
        return "LIGHT";
    }
}

//Save the current settings values of input fields
function handleSettingsChange(event) {
    event.preventDefault();
    browser.storage.sync.set({
        theme: getTheme(),
        accent: document.querySelector("#accentColorPicker").value,
        bgColor: document.querySelector("#bgColorPicker").value,
        accentHover: document.querySelector("#accentHoverColorPicker").value,
        startLocation: document.querySelector("#location").value,
    });
}

document.querySelector("form").addEventListener("submit", handleSettingsChange);
document.addEventListener("DOMContentLoaded", restoreSettings);
