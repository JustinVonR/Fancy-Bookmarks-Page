let currTreePos = [];
let iconThemePostfix = "";

/* Gets settings for user selected colors from sync storage and applies stylesheets for the user's colors. */
async function loadThemeSettings() {
    try {
        //Clear existing stylesheet if it already exists
        if (document.querySelector("style") != null) {
            document.querySelector("style").remove();
        }
        //Get the relevant settings from browser storage
        let settings = await browser.storage.sync.get(["theme","accent","bgColor","accentHover"]);
        //Apply the correct stylesheet for the selected theme
        let stylesheet = document.querySelector("link");
        //Create new stylesheet link only if one doesn't already exist
        if (stylesheet == null) {
            stylesheet = document.createElement("link");
            stylesheet.rel = "stylesheet";
            stylesheet.type = "text/css";
        }
        //Set the correct stylesheet file based on selected theme
        if (settings.theme == "DARK") {
            stylesheet.href = "darkTheme.css";
            iconThemePostfix = "-dark";
        } else {
            stylesheet.href = "lightTheme.css";
            iconThemePostfix = "";
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

        //Set svg color of gear icon for light or dark theme
        document.querySelector(".gear").src = `../Icons/gear${iconThemePostfix}.svg`;

        //Set svg color of and file path arrows that already exist for light or dark theme
        let filePathArrows = document.querySelectorAll(".filePathImg");
        console.log(filePathArrows);
        filePathArrows.forEach((arrow) => arrow.src = `../Icons/arrow-right${iconThemePostfix}-32.svg`);

    } catch (exception) {
        console.log(`Error while loading user color settings: ${exception}`);
    }
}

/* Adds all of the bookmarks within currNodeChildren to the page as clickable divs */
async function displayBookmarks(currNodeChildren) {
    linksDiv = document.querySelector("div.links");
    linksDiv.innerHTML = '';
    for (i = 0; i < currNodeChildren.length; i++) {
        if (currNodeChildren[i].type == "bookmark") {
            newSpan = document.createElement("span");
            newSpan.className = "link";
            newSpan.innerHTML = currNodeChildren[i].title;

            newTile = document.createElement("div");
            newTile.className = "link usr-accent-text";
            newTile.appendChild(newSpan);

            newLink = document.createElement("a");
            newLink.href = currNodeChildren[i].url;
            newLink.target = "_blank";
            newLink.appendChild(newTile);

            linksDiv.appendChild(newLink);
        }
    }
}

/* Sets the path text in the header based on currNode and displays all of the subfolders of currNodeChildren in the nav of the page */
async function displaySubfolders(currNode, currNodeChildren) {
    // Set the header text to show the path to the current folder, using svg arrows to separate titles
    headerText = document.querySelector(".header-text");
    headerText.innerHTML = "";
    if (currTreePos.length > 1) {
        console.log("currTreePos:");
        console.log(currTreePos);
        for (i = 1; i < currTreePos.length - 1; i++){
            let node = await browser.bookmarks.get(currTreePos[i]);
            console.log("Node Processed for Title:");
            console.log(node);
            headerText.innerHTML += node[0].title + `&nbsp;&nbsp;<img src=\"../Icons/arrow-right${iconThemePostfix}-32.svg\" width=\"20px\" alt=\"Settings\" title=\"Settings\" class=\"filePathImg\"/>&nbsp;&nbsp;`;
        }
    }
    headerText.innerHTML += currNode.title;
    
    // Generate a back button if deep enough in bookmark tree.
    nav = document.querySelector("nav");
    nav.innerHTML = "";
    if (currTreePos.length > 1) {
        backDiv = document.createElement("div");
        backDiv.className = "nav usr-accent-bg back";
        backDiv.innerHTML = `<img src=\"../Icons/arrow-left-dark-32.svg\" width=\"20px\" alt=\"Settings\" title=\"Settings\"/>&nbsp;&nbsp;Back`;
        nav.appendChild(backDiv);
        backDiv.addEventListener('click', function() {
            currTreePos.pop();
            loadBookmarks();
        });
    }

    // Generate nav elements for all subfolders within currNodeCHildren.
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

/* Loads the browser's bookmark tree and calls for its display on the page */
async function loadBookmarks() {
    let success = false;
    //This loop attempts to get details for the last folder but steps back up the tree
    //if an error occurs. This behaviour attempts to ensure that if a folder is deleted
    //the site will refresh to the next lowest folder that still exists.
    while (currTreePos.length >= 1 && !success) {
        try {
            let currNode = await browser.bookmarks.get(currTreePos[currTreePos.length - 1]);
            let currNodeChildren = await browser.bookmarks.getChildren(currTreePos[currTreePos.length - 1]);
            currNode = currNode[0];
            displayBookmarks(currNodeChildren);
            displaySubfolders(currNode, currNodeChildren);
            success = true;
        } catch (e) {
            currTreePos.pop();
            if (currTreePos.length >= 1) {
                continue;
            }
            console.log(`Error while loading and displaying bookmarks: ${e}`);
        }
    }
}

/* Sets the first two bookmark object ids to reach the user's selected start folder in the bookmark tree */
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

/* Opens the extension's preference page in a new tab */
function openSettingsTab() {
    let openSettings = browser.tabs.create({
      url: "/Settings Page/settings.html",
    });
    function onCreated() {
      console.log("Created Settings page");
    }
    function onError(error) {
      console.log(`Error while opening settings page: ${error}`);
    }
    openSettings.then(onCreated, onError);
}

/* Loads settings and bookmark data asynchronously to ensure correct order of loading */
async function loadPageContent() {
    await setStartLocation();
    loadThemeSettings();
    loadBookmarks();
}

//Load settings and bookmarks after DOM content is loaded; Rest of page's logic starts from here
document.addEventListener("DOMContentLoaded", loadPageContent);

//Add listener to open extension preferences when the settings button in the header is clicked
document.querySelector(".settings-btn").addEventListener("click", openSettingsTab);

//Add listeners to refresh page when settings or bookmarks change:
browser.bookmarks.onCreated.addListener(loadBookmarks);
browser.bookmarks.onRemoved.addListener(loadBookmarks);
browser.bookmarks.onChanged.addListener(loadBookmarks);
browser.bookmarks.onMoved.addListener(loadBookmarks);

browser.storage.onChanged.addListener(loadThemeSettings);
