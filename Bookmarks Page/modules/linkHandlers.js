async function deleteBookmark(bookmarkNode, reloadFunc) {
    browser.bookmarks.remove(bookmarkNode.id);
    reloadFunc();
}