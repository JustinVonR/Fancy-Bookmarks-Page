function loadTheming() {
    function applySettings(result) {
        //Apply the correct stylesheet for the selected theme:
        let styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.type = "text/css";
        if (result.theme == "DARK") {
            styleLink.href = "darkTheme.css";
        } else {
            styleLink.href = "lightTheme.css";
        }
        document.head.appendChild( styleLink );

        console.log(document.querySelector("div.links"));
        document.querySelector("div.link-region").style = `background-color: ${result.bgColor}`;
        linkTiles = document.querySelectorAll("div.link");
        linkTiles.forEach(element => {
            element.style = `color: ${result.accent}`
        });
    }

    function onSettingsError(error) {
        console.log(`Error while getting settings: \n ${error}`);
    }

    let getSettings = browser.storage.sync.get();
    getSettings.then(applySettings, onSettingsError);
}

document.addEventListener("DOMContentLoaded", loadTheming);