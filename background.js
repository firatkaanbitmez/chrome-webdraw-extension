chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["draw.js"]
    }, () => {
        chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["styles/panel.css"]
        });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (!document.getElementById('control-panel')) {
                    const panel = document.createElement('div');
                    panel.id = 'control-panel';
                    
                    const dropdownButton = document.createElement('button');
                    const dropdownImage = document.createElement('img');
                    dropdownImage.src = chrome.runtime.getURL('icons/draw-128.png');
                    dropdownButton.appendChild(dropdownImage);

                    const stopButton = document.createElement('button');
                    stopButton.innerText = 'Stop Drawing';
                    stopButton.classList.add('action-button');

                    const clearButton = document.createElement('button');
                    clearButton.innerText = 'Clear Drawing';
                    clearButton.classList.add('action-button');

                    stopButton.addEventListener('click', () => {
                        const canvas = document.querySelector('#webdraw-canvas');
                        if (canvas) canvas.style.display = 'none';
                        document.body.style.cursor = 'default';
                        panel.style.display = 'none';
                        localStorage.setItem('isDrawingActive', 'false');
                    });

                    clearButton.addEventListener('click', () => {
                        const canvas = document.querySelector('#webdraw-canvas');
                        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                    });

                    panel.appendChild(dropdownButton);
                    panel.appendChild(clearButton);
                    panel.appendChild(stopButton);
                    document.body.appendChild(panel);
                }

                document.getElementById('control-panel').style.display = 'flex';

                const canvas = document.getElementById('webdraw-canvas');
                if (canvas) canvas.style.display = 'block';
                localStorage.setItem('isDrawingActive', 'true');
            }
        });
    });
});
