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
                    dropdownButton.id = 'dropdown-button';
                    const dropdownImage = document.createElement('img');
                    dropdownImage.src = chrome.runtime.getURL('icons/draw-128.png');
                    dropdownButton.appendChild(dropdownImage);

                    const dropdownMenu = document.createElement('div');
                    dropdownMenu.id = 'dropdown-menu';

                    const colorPicker = document.createElement('input');
                    colorPicker.type = 'color';
                    colorPicker.classList.add('action-picker');
                    colorPicker.value = '#FF0000'; // Default red color

                    const thicknessInput = document.createElement('input');
                    thicknessInput.type = 'range';
                    thicknessInput.min = '1';
                    thicknessInput.max = '20';
                    thicknessInput.value = localStorage.getItem('currentThickness') || '5'; // Default kalınlık

                    const undoButton = document.createElement('button');
                    undoButton.innerText = 'Undo';
                    undoButton.classList.add('action-button');

                    const stopButton = document.createElement('button');
                    stopButton.innerText = 'Stop Drawing';
                    stopButton.classList.add('action-button');

                    const clearButton = document.createElement('button');
                    clearButton.innerText = 'Clear Drawing';
                    clearButton.classList.add('action-button');

                    undoButton.addEventListener('click', () => {
                        window.dispatchEvent(new Event('undoDrawing'));
                    });

                    stopButton.addEventListener('click', () => {
                        const canvas = document.querySelector('#webdraw-canvas');
                        if (canvas) canvas.style.display = 'none';
                        document.body.style.cursor = 'default';
                        panel.style.display = 'none';
                        localStorage.setItem('isDrawingActive', 'false');
                    });

                    clearButton.addEventListener('click', () => {
                        window.dispatchEvent(new Event('clearCanvas'));
                    });

                    dropdownMenu.appendChild(colorPicker);
                    dropdownMenu.appendChild(thicknessInput);
                    dropdownMenu.appendChild(undoButton);
                    dropdownMenu.appendChild(clearButton);
                    dropdownMenu.appendChild(stopButton);
                    panel.appendChild(dropdownButton);
                    panel.appendChild(dropdownMenu);
                    document.body.appendChild(panel);

                    dropdownButton.addEventListener('click', () => {
                        const isMenuVisible = dropdownMenu.style.display === 'flex';
                        dropdownMenu.style.display = isMenuVisible ? 'none' : 'flex';
                    });

                    // Renk ve kalınlık ayarlarının senkronizasyonu
                    colorPicker.addEventListener('input', () => {
                        localStorage.setItem('currentColor', colorPicker.value);
                    });

                    thicknessInput.addEventListener('input', () => {
                        localStorage.setItem('currentThickness', thicknessInput.value);
                    });

                    // Sayfa ilk açıldığında kalem kalınlığını senkronize et
                    localStorage.setItem('currentThickness', thicknessInput.value);
                    localStorage.setItem('currentColor', colorPicker.value);
                }

                document.getElementById('control-panel').style.display = 'flex';

                const canvas = document.getElementById('webdraw-canvas');
                if (canvas) canvas.style.display = 'block';
                localStorage.setItem('isDrawingActive', 'true');
            }
        });
    });
});
