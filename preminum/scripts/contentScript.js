const injectScript = function(filename) {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL(filename);
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement)
    .appendChild(s);
};
["scripts/wsHook.js", "scripts/adsRemoval.js", "scripts/sweetalert.min.js"].forEach(injectScript);