document.getElementById("start-drawing").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["draw.js"]
        });
    });
});

document.getElementById("clear-drawing").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const canvas = document.querySelector('#webdraw-canvas');
                if (canvas) {
                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        });
    });
});

document.getElementById("stop-drawing").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const canvas = document.querySelector('#webdraw-canvas');
                if (canvas) {
                    canvas.style.display = 'none'; // Canvas'ı gizle
                }
                document.body.style.cursor = 'default'; // Fare imlecini varsayılan hale getir
            }
        });
    });
});
