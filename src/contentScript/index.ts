// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.command === 'balance') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.querySelector('body'));
    }
});

console.log('injected here');
