function onError(error) {
    console.log(error);
}


function handleThemeChange(themeRadio) {
    browser.storage.sync.set(settings);
}

async function init() {
    try {
        settings= await browser.storage.sync.get({
            theme: "DARK",
            accent: "#ce35ce",
            bgType: "COLOR",
            bgFile: "No File Selected",
            bgColor: "#000000"
        });
        applyCurrentSettings(settings);
    } catch (error) {
        onError(error);
    }
    initEventListeners();
}

function applyCurrentSettings() {

}

function initEventListeners() {
    let settingsForm = document.getElementsByClassName("settingsForm");
    settingsForm.addEventListener('change', handleFormChange(target));
}

function getRadioVal(radioName) {
    let radioElements = Array.from(document.querySelectorAll(`input[name=${radioName}]`));
    let value;
    for (element in radioElements) {
        if (element.checked) {
            value = element.value;
        }
    }
    return value;
}

function handleFormChange(target) {
    console.log(`The target ${target} was interacted with.`);
}

