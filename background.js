chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["draw.js"]
    }, () => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (!document.getElementById('control-panel')) {
                    const panel = document.createElement('div');
                    panel.id = 'control-panel';
                    panel.style.position = 'fixed';
                    panel.style.top = '20px';
                    panel.style.right = '20px';
                    panel.style.backgroundColor = '#ffffff';
                    panel.style.padding = '10px';
                    panel.style.borderRadius = '12px';
                    panel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    panel.style.zIndex = '10000';
                
                    const dropdownContainer = document.createElement('div');
                    dropdownContainer.style.position = 'relative';
                
                    const dropdownButton = document.createElement('button');
                    dropdownButton.style.backgroundColor = 'transparent';
                    dropdownButton.style.border = 'none';
                    dropdownButton.style.padding = '0';
                    dropdownButton.style.cursor = 'pointer';
                
                    const dropdownImage = document.createElement('img');
                    dropdownImage.src = chrome.runtime.getURL('icons/draw-128.png');
                    dropdownImage.style.width = '40px';
                    dropdownImage.style.height = '40px';
                    dropdownImage.style.borderRadius = '50%';
                
                    dropdownButton.appendChild(dropdownImage);
                
                    const dropdownMenu = document.createElement('div');
                    dropdownMenu.style.position = 'absolute';
                    dropdownMenu.style.top = '50px';
                    dropdownMenu.style.right = '0';
                    dropdownMenu.style.backgroundColor = '#ffffff';
                    dropdownMenu.style.border = '1px solid #ccc';
                    dropdownMenu.style.borderRadius = '8px';
                    dropdownMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    dropdownMenu.style.padding = '10px';
                    dropdownMenu.style.display = 'none';
                    dropdownMenu.style.flexDirection = 'column';
                    dropdownMenu.style.gap = '10px';
                
                    const stopButton = document.createElement('button');
                    stopButton.innerText = 'Stop Drawing';
                    stopButton.style.backgroundColor = '#007BFF';
                    stopButton.style.color = '#ffffff';
                    stopButton.style.border = 'none';
                    stopButton.style.padding = '10px';
                    stopButton.style.borderRadius = '8px';
                    stopButton.style.cursor = 'pointer';
                
                    const clearButton = document.createElement('button');
                    clearButton.innerText = 'Clear Drawing';
                    clearButton.style.backgroundColor = '#007BFF';
                    clearButton.style.color = '#ffffff';
                    clearButton.style.border = 'none';
                    clearButton.style.padding = '10px';
                    clearButton.style.borderRadius = '8px';
                    clearButton.style.cursor = 'pointer';
                
                    dropdownButton.addEventListener('click', () => {
                        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'flex' : 'none';
                    });
                
                    stopButton.addEventListener('click', () => {
                        const canvas = document.querySelector('#webdraw-canvas');
                        if (canvas) {
                            canvas.style.display = 'none';
                        }
                        document.body.style.cursor = 'default';
                        panel.style.display = 'none';
                        localStorage.setItem('isDrawingActive', 'false');
                    });
                
                    clearButton.addEventListener('click', () => {
                        const canvas = document.querySelector('#webdraw-canvas');
                        if (canvas) {
                            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                        }
                    });
                
                    dropdownMenu.appendChild(clearButton);
                    dropdownMenu.appendChild(stopButton);
                    dropdownContainer.appendChild(dropdownButton);
                    dropdownContainer.appendChild(dropdownMenu);
                    panel.appendChild(dropdownContainer);
                    document.body.appendChild(panel);
                }
                
                document.getElementById('control-panel').style.display = 'flex';

                // Ensure that drawing is active when starting again
                const canvas = document.getElementById('webdraw-canvas');
                if (canvas) {
                    canvas.style.display = 'block';
                }
                localStorage.setItem('isDrawingActive', 'true');
            }
        });
    });
});
