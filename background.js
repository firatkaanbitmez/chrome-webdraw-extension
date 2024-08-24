chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["draw.js"]
    }, () => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Sağ üst köşeye kontrol butonlarını ekleme
                if (!document.getElementById('control-panel')) {
                    const panel = document.createElement('div');
                    panel.id = 'control-panel';
                    panel.style.position = 'fixed';
                    panel.style.top = '20px';
                    panel.style.right = '20px';
                    panel.style.display = 'flex';
                    panel.style.flexDirection = 'column';
                    panel.style.gap = '10px';
                    panel.style.backgroundColor = '#ffffff';
                    panel.style.padding = '10px';
                    panel.style.borderRadius = '12px';
                    panel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    panel.style.zIndex = '10000';

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

                    stopButton.addEventListener('click', () => {
                        const canvas = document.querySelector('#webdraw-canvas');
                        if (canvas) {
                            canvas.style.display = 'none';
                        }
                        document.body.style.cursor = 'default';
                        panel.style.display = 'none'; // Paneli gizle
                    });

                    clearButton.addEventListener('click', () => {
                        const canvas = document.querySelector('#webdraw-canvas');
                        if (canvas) {
                            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                        }
                    });

                    panel.appendChild(clearButton);
                    panel.appendChild(stopButton);
                    document.body.appendChild(panel);
                }

                // Paneli görünür hale getir
                document.getElementById('control-panel').style.display = 'flex';
            }
        });
    });
});
