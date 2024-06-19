BOOKMARK_TREE = null;
TREE_POSITION = [];

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

        //document.querySelector(".selected").style = `background-color: ${result.accent}`;
    }

    function onSettingsError(error) {
        console.log(`Error while getting settings: \n ${error}`);
    }
    let getSettings = browser.storage.sync.get();
    getSettings.then(applySettings, onSettingsError);
}

function displayBookmarks() {
    currDisplayNode = TREE_POSITION[TREE_POSITION.length - 1];
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
            newTile.className = "link";
            newLink.appendChild(newTile);
            linksDiv.appendChild(newLink);
        }
    }
    loadTheming();
}

function displaySubfolders() {
    currDisplayNode = TREE_POSITION[TREE_POSITION.length - 1];
    headerText = document.querySelector(".header-text");
    headerText.innerHTML = "";
    if (TREE_POSITION.length > 2) {
        console.log(TREE_POSITION);
        for (i = 1; i < TREE_POSITION.length - 1; i++) {
            headerText.innerHTML += TREE_POSITION[i].title + " > ";
        }
    }
    headerText.innerHTML += TREE_POSITION[TREE_POSITION.length - 1].title;
    
    nav = document.querySelector("nav");
    nav.innerHTML = "";
    if (TREE_POSITION.length > 1) {
        backDiv = document.createElement("div");
        backDiv.class = "nav";
        backDiv.innerHTML = "< Back";
        nav.appendChild(backDiv);
        backDiv.addEventListener('click', function() {
            console.log("going back");
            TREE_POSITION.pop();
            displayBookmarks();
            displaySubfolders();
        });
    }
    for (i = 0; i < currDisplayNode.children.length; i++) {
        if (currDisplayNode.children[i].type == "folder") {
            newDiv = document.createElement("div");
            newDiv.class = "nav";
            newDiv.innerHTML = currDisplayNode.children[i].title;
            nav.appendChild(newDiv);
            newDiv.id = i;
            newDiv.addEventListener('click', function(event) {
                console.log(event);
                TREE_POSITION.push(TREE_POSITION[TREE_POSITION.length - 1].children[event.target.id]);
                displayBookmarks();
                displaySubfolders();
            });
        }
    }
}

function storeCurrentBookmarks(bookmarkTree) {
    console.log("Successfully obtained bookmark tree:");
    console.log(bookmarkTree[0]);
    BOOKMARK_TREE = 0
    TREE_POSITION = [bookmarkTree[0]];
    // TODO: Add switch to determine starting location dynamically from settings.
    TREE_POSITION.push(TREE_POSITION[0].children[1]);
    console.log(TREE_POSITION.length);
    console.log("Set position in tree to:");
    console.log(TREE_POSITION[TREE_POSITION.length - 1]);
    displaySubfolders();
    displayBookmarks();
}

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

loadBookmarkTree();
