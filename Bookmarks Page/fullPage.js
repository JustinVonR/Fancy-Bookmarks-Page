let currTreePos = [];
let iconThemePostfix = "";

/*
 * Gets settings for user selected colors from sync storage and applies stylesheets for the user's colors.
*/
async function loadThemeSettings() {
    try {
        //Get the relevant settings from browser storage
        let settings = await browser.storage.sync.get(["theme","accent","bgColor","accentHover"]);
        //Apply the correct stylesheet for the selected theme:
        let stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.type = "text/css";
        if (settings.theme == "DARK") {
            stylesheet.href = "darkTheme.css";
            iconThemePostfix = "-dark";
        } else {
            stylesheet.href = "lightTheme.css";
        }
        document.head.appendChild(stylesheet);

        //Insert stylesheet with color values defined by the user into the document's head.
        let userStyles = document.createElement("style");
        userStyles.innerHTML = ` 
            .usr-accent-text {color: ${settings.accent};} 
            .usr-accent-bg {background-color: ${settings.accent};}
            .usr-background-color {background-color: ${settings.bgColor};}
            .usr-accent-bg:hover {background-color: ${settings.accentHover};}
            .usr-accent-text:hover {color: ${settings.accentHover};}
        `;
        document.head.appendChild(userStyles);
        document.querySelector(".gear").src = `gear${iconThemePostfix}.svg`;
    } catch (exception) {
        console.log(`Error while loading user color settings: ${exception}`);
    }
}

async function displayBookmarks(currNodeChildren) {
    linksDiv = document.querySelector("div.links");
    linksDiv.innerHTML = '';
    for (i = 0; i < currNodeChildren.length; i++) {
        if (currNodeChildren[i].type == "bookmark") {
            newLink = document.createElement("a");
            newTile = document.createElement("div");
            newSpan = document.createElement("span");
            newLink.href = currNodeChildren[i].url;
            newLink.target = "_blank";
            newSpan.innerHTML = currNodeChildren[i].title;
            newTile.appendChild(newSpan);
            newTile.className = "link usr-accent-text";
            newLink.appendChild(newTile);
            linksDiv.appendChild(newLink);
        }
    }
}


async function displaySubfolders(currNode, currNodeChildren) {
    headerText = document.querySelector(".header-text");
    headerText.innerHTML = "";
    if (currTreePos.length > 1) {
        console.log("currTreePos:");
        console.log(currTreePos);
        for (i = 1; i < currTreePos.length - 1; i++){
            let node = await browser.bookmarks.get(currTreePos[i]);
            console.log("Node Processed for Title:");
            console.log(node);
            headerText.innerHTML += node[0].title + `&nbsp;&nbsp;<img src=\"arrow-right${iconThemePostfix}-32.svg\" width=\"20px\" alt=\"Settings\" title=\"Settings\"/>&nbsp;&nbsp;`;
        }
    }
    headerText.innerHTML += currNode.title;

    nav = document.querySelector("nav");
    nav.innerHTML = "";
    if (currTreePos.length > 1) {
        backDiv = document.createElement("div");
        backDiv.className = "nav usr-accent-bg back";
        backDiv.innerHTML = `<img src=\"arrow-left-dark-32.svg\" width=\"20px\" alt=\"Settings\" title=\"Settings\"/>&nbsp;&nbsp;Back`;
        nav.appendChild(backDiv);
        backDiv.addEventListener('click', function() {
            currTreePos.pop();
            loadBookmarks();
        });
    }
    for (i = 0; i < currNodeChildren.length; i++) {
        if (currNodeChildren[i].type == "folder") {
            newDiv = document.createElement("div");
            newDiv.className = "nav";
            newDiv.innerHTML = currNodeChildren[i].title;
            nav.appendChild(newDiv);
            newDiv.id = currNodeChildren[i].id;
            newDiv.addEventListener('click', function(event) {
                currTreePos.push(event.target.id);
                loadBookmarks();
            });
        }
    }
}

/*
 * Sets the start location based on the user's settings and loads the correct bookmarks folder.
*/
async function loadBookmarks() {
    let currNode = await browser.bookmarks.get(currTreePos[currTreePos.length - 1]);
    let currNodeChildren = await browser.bookmarks.getChildren(currTreePos[currTreePos.length - 1]);
    currNode = currNode[0];
    displayBookmarks(currNodeChildren);
    displaySubfolders(currNode, currNodeChildren);
}

/*
 * Sets the first two bookmark object ids to reach the user's selected start folder in the bookmark tree.
 */
async function setStartLocation() {
    let startLocation = await browser.storage.sync.get("startLocation");
    startLocation = startLocation.startLocation;
    bookmarkTree = await browser.bookmarks.getTree();
    bookmarkTree = bookmarkTree[0];
    currTreePos.push(bookmarkTree.id);
    switch (startLocation) {
        case "toolbar":
            currTreePos.push(bookmarkTree.children[1].id);
            break;
        case "menu":
            currTreePos.push(bookmarkTree.children[0].id);
            break;
        case "mobile":
            currTreePos.push(bookmarkTree.children[3].id);
            break;
        case "unfiled":
            currTreePos.push(bookmarkTree.children[2].id);
            break;
        default:
            break;
    }
}

//Opens the extension's preference page in a new tab.
function openSettingsTab() {
    let openSettings = browser.tabs.create({
      url: "/Settings Page/settings.html",
    });
    function onCreated() {
      console.log("Created Settings Page");
    }
    function onError(error) {
      console.log(`Error while opening reloadPagesettings page: ${error}`);
    }
    creating.then(onCreated, onError);
}

//Loads settings and bookmark data asynchronously to ensure correct order of loading.
// TODO: Add proper error handling to this function
async function loadPageContent() {
    await setStartLocation();
    loadThemeSettings();
    loadBookmarks();
}

//Load settings and bookmarks after DOM content is loaded:
document.addEventListener("DOMContentLoaded", loadPageContent);

//Add listener to open extension preferences when the settings button in the header is clicked:
document.querySelector(".settings-btn").addEventListener("click", openSettingsTab);
