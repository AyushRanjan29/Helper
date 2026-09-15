chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "PROBLEM_DATA") {
        console.log("Received Problem Data:", message.data);

        chrome.storage.local.set({
            problemData: message.data,
        });
    }
});