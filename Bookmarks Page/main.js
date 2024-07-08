let currTreePos = [];
let iconThemePostfix = "";

/* Gets settings for user selected colors from sync storage and applies stylesheets for the user's colors. */
async function loadThemeSettings() {
    try {
        //Clear existing stylesheet if it already exists
        if (document.querySelector("style")) {
            document.querySelector("style").remove();
        }
        //Get the relevant settings from browser storage
        let settings = await browser.storage.sync.get(["theme","accent","bgColor","accentHover"]);
        //Apply the correct stylesheet for the selected theme
        let stylesheet = document.querySelector("link");
        //Create new stylesheet link only if one doesn't already exist
        if (!stylesheet) {
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
        let css = ` 
            .usr-accent-text {color: ${settings.accent};} 
            .usr-accent-bg {background-color: ${settings.accent};}
            .usr-background-color {background-color: ${settings.bgColor};}
            .usr-accent-bg:hover {background-color: ${settings.accentHover};}
            .usr-accent-text:hover {color: ${settings.accentHover};}
        `;
        userStyles.appendChild(document.createTextNode(css));
        document.head.appendChild(userStyles);

        //Set svg color of gear icon for light or dark theme
        document.querySelector(".gear").src = `../Icons/gear${iconThemePostfix}.svg`;

        //Set svg color of and file path arrows that already exist for light or dark theme
        let filePathArrows = document.querySelectorAll(".filepath-img");
        filePathArrows.forEach((arrow) => arrow.src = `../Icons/arrow-right${iconThemePostfix}-32.svg`);

        let linkIcons = document.querySelectorAll(".link-icon");
        linkIcons.forEach((icon) => icon.src = `../Icons/link${iconThemePostfix}.svg`);


    } catch (exception) {
        console.log(`Error while loading user color settings: ${exception}`);
    }
}

/* Adds all of the bookmarks within currNodeChildren to the page as clickable divs */
async function displayBookmarks(currNodeChildren) {
    linksDiv = document.querySelector("div.links");
    while (linksDiv.firstChild) {
        linksDiv.removeChild(linksDiv.lastChild);
    }
    for (i = 0; i < currNodeChildren.length; i++) {
        if (currNodeChildren[i].type == "bookmark") {
            let newSpan = document.createElement("span");
            newSpan.className = "link";
            newSpan.appendChild(document.createTextNode(currNodeChildren[i].title));

            let linkIcon = document.createElement("img");
            linkIcon.src = `../Icons/link${iconThemePostfix}.svg`;
            linkIcon.style.width = "100px";
            linkIcon.style.height = "100px";
            linkIcon.alt = "Settings";
            linkIcon.title = "Settings";
            linkIcon.className = "link-icon";

            let newTile = document.createElement("div");
            newTile.className = "link usr-accent-text";
            newTile.appendChild(linkIcon);
            newTile.appendChild(newSpan);

            let newLink = document.createElement("a");
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
        for (i = 1; i < currTreePos.length - 1; i++){
            let node = await browser.bookmarks.get(currTreePos[i]);
            headerText.appendChild(document.createTextNode(node[0].title));
            headerText.innerHTML += "&nbsp;&nbsp;";
            let rightArrow = document.createElement("img");
            rightArrow.src = `../Icons/arrow-right${iconThemePostfix}-32.svg`;
            rightArrow.style.width = "20px";
            rightArrow.style.height = "20px";
            rightArrow.alt = "Right arrow";
            rightArrow.className = "filepath-img";
            headerText.appendChild(rightArrow);
            headerText.innerHTML += "&nbsp;&nbsp;";
        }
    }
    headerText.appendChild(document.createTextNode(currNode.title));
    
    // Generate a back button if deep enough in bookmark tree.
    nav = document.querySelector("nav");
    while (nav.firstChild) {
        nav.removeChild(nav.lastChild);
    }
    if (currTreePos.length > 1) {
        backDiv = document.createElement("div");
        backDiv.className = "nav usr-accent-bg back";
        let backArrow = document.createElement("img");
        backArrow.src = "../Icons/arrow-left-dark-32.svg";
        backArrow.style.width = "20px";
        backArrow.style.height = "20px";
        backArrow.alt = "Settings";
        backArrow.title = "Settings";
        backDiv.appendChild(backArrow);
        backDiv.innerHTML += "&nbsp;&nbsp;"
        backDiv.appendChild(document.createTextNode("Back"));
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
            newDiv.appendChild(document.createTextNode(currNodeChildren[i].title));
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
