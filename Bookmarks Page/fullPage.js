let settings;
currBookmarkTree = null;
currTreePos = [];

async function loadSettings() {
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
        document.head.appendChild(styleLink);
        
        userStyles = document.createElement("style");
        userStyles.innerHTML = ` 
            .usr-accent-text {color: ${result.accent};} 
            .usr-accent-bg {background-color: ${result.accent};}
            .usr-background-color {background-color: ${result.bgColor};}
            .usr-accent-bg:hover {background-color: ${result.accentHover};}
            .usr-accent-text:hover {color: ${result.accentHover};}
        `;
        document.head.appendChild(userStyles);

        //document.querySelector(".selected").style = `background-color: ${result.accent}`;
        startLocation = result.startLocation;
        console.log(`Set start location to: ${result.startLocation}`);
    }

    function onSettingsError(error) {
        console.log(`Error while getting settings: \n ${error}`);
    }
    let getSettings = browser.storage.sync.get();
    getSettings.then(applySettings, onSettingsError);
    console.log("Does this run first?");
}

function displayBookmarks() {
    currDisplayNode = currTreePos[currTreePos.length - 1];
    linksDiv = document.querySelector("div.links");
    linksDiv.innerHTML = '';
    for (i = 0; i < currDisplayNode.children.length; i++) {
        if (currDisplayNode.children[i].type == "bookmark") {
            newLink = document.createElement("a");
            newTile = document.createElement("div");
            newSpan = document.createElement("span");
            newLink.href = currDisplayNode.children[i].url;
            newLink.target = "_blank";
            newSpan.innerHTML = currDisplayNode.children[i].title;
            newTile.appendChild(newSpan);
            newTile.className = "link usr-accent-text";
            newLink.appendChild(newTile);
            linksDiv.appendChild(newLink);
        }
    }
    loadTheming();
}


function displaySubfolders() {
    currDisplayNode = [currTreePos.length - 1];
    headerText = document.querySelector(".header-text");
    headerText.innerHTML = "";
    if (currTreePos.length > 2) {
        console.log(currTreePos);
        for (i = 1; i < currTreePos.length - 1; i++) {
            headerText.innerHTML += currTreePos[i].title + " > ";
        }
    }
    headerText.innerHTML += currTreePos[currTreePos.length - 1].title;
    
    nav = document.querySelector("nav");
    nav.innerHTML = "";
    if (currTreePos.length > 1) {
        backDiv = document.createElement("div");
        backDiv.className = "nav usr-accent-bg";
        console.log("set class of back element");
        backDiv.innerHTML = "< Back";
        nav.appendChild(backDiv);
        backDiv.addEventListener('click', function() {
            console.log("going back");
            currTreePos.pop();
            displayBookmarks();
            displaySubfolders();
        });
    }
    for (i = 0; i < currDisplayNode.children.length; i++) {
        if (currDisplayNode.children[i].type == "folder") {
            newDiv = document.createElement("div");
            newDiv.className = "nav";
            newDiv.innerHTML = currDisplayNode.children[i].title;
            nav.appendChild(newDiv);
            newDiv.id = i;
            newDiv.addEventListener('click', function(event) {
                console.log(event);
                currTreePos.push(currTreePos[currTreePos.length - 1].children[event.target.id]);
                displayBookmarks();
                displaySubfolders();
            });
        }
    }
}

function storeCurrentBookmarks(bookmarkTree) {
    console.log("Successfully obtained bookmark tree:");
    console.log(bookmarkTree[0]);
    currBookmarkTree = 0
    currTreePos = [bookmarkTree[0]];
    if (startLocation == "toolbar") {
        currTreePos.push(currTreePos[0].children[1]);
    } else if (startLocation == "menu") {
        currTreePos.push(currTreePos[0].children[0]);
    } else if (startLocation == "mobile") {
        currTreePos.push(currTreePos[0].children[3]);
    } else {
        currTreePos.push(currTreePos[0].children[2]);
    }
    console.log(currTreePos.length);
    console.log("Set position in tree to:");
    console.log(currTreePos[currTreePos.length - 1]);
    //displaySubfolders();
    displayBookmarks();
}

//TODO: Split bookmark handling into separate imported class.
function loadBookmarkTree() {
    function onFail(error) {
        console.log(`Error with bookmark loading: ${error}`);
    }

    let getBookmarkTree = browser.bookmarks.getTree();
    getBookmarkTree.then(storeCurrentBookmarks, onFail);
}

function handleSettingsBtn() {
    let openSettings = browser.tabs.create({
      url: "/Settings Page/settings.html",
    });

    function onCreated() {
      consols.log("Created Settings Page");
    }

    function onError(error) {
      console.log(`Error while opening reloadPagesettings page: ${error}`);
    }

    creating.then(onCreated, onError);
}

// TODO: Update this code so that only bookmark data is refreshed instead of 
// entire page.
function refreshPage() {
    loadBookmarkTree();
    loadTheming();
}

document.addEventListener("DOMContentLoaded", loadTheming);

document.querySelector(".settings-btn").addEventListener("click", handleSettingsBtn);

//Add listeners to reload for any change to bookmark tree:
browser.bookmarks.onChanged.addListener(refreshPage);
browser.bookmarks.onCreated.addListener(refreshPage);
browser.bookmarks.onMoved.addListener(refreshPage);
browser.bookmarks.onRemoved.addListener(refreshPage);

try {
    settings = await browser.storage.sync.get();
} catch (e) {
    console.log(`Error while getting settings from browser sync storage: ${e}`);
    document.querySelector("div.link-region").innerHTML = "Error Getting Settings";
}
loadBookmarkTree();
