let isDrawingActive = false; // Çizimin aktif olup olmadığını kontrol etmek için değişken

chrome.action.onClicked.addListener((tab) => {
    if (!isDrawingActive) {
        // Çizim başlatıldığında
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

                        // Sabit Undo, Redo, Clear Butonları
                        const undoButton = document.createElement('button');
                        undoButton.classList.add('action-button');
                        const undoIcon = document.createElement('img');
                        undoIcon.src = chrome.runtime.getURL('icons/undo.png');
                        undoButton.appendChild(undoIcon);

                        const redoButton = document.createElement('button');
                        redoButton.classList.add('action-button');
                        const redoIcon = document.createElement('img');
                        redoIcon.src = chrome.runtime.getURL('icons/redo.png');
                        redoButton.appendChild(redoIcon);

                        const clearButton = document.createElement('button');
                        clearButton.classList.add('action-button');
                        const clearIcon = document.createElement('img');
                        clearIcon.src = chrome.runtime.getURL('icons/clear.png');
                        clearButton.appendChild(clearIcon);

                        // Undo, Redo ve Clear butonlarının olay dinleyicileri
                        undoButton.addEventListener('click', () => {
                            window.dispatchEvent(new Event('undoDrawing'));
                        });

                        redoButton.addEventListener('click', () => {
                            window.dispatchEvent(new Event('redoDrawing'));
                        });

                        clearButton.addEventListener('click', () => {
                            window.dispatchEvent(new Event('clearCanvas'));
                        });

                        // Dropdown menü butonu
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
                        colorPicker.value = '#FF0000'; // Varsayılan kırmızı renk

                        const thicknessInput = document.createElement('input');
                        thicknessInput.type = 'range';
                        thicknessInput.min = '1';
                        thicknessInput.max = '20';
                        thicknessInput.value = localStorage.getItem('currentThickness') || '5'; // Varsayılan kalınlık

                        dropdownMenu.appendChild(colorPicker);
                        dropdownMenu.appendChild(thicknessInput);

                        panel.appendChild(undoButton);
                        panel.appendChild(redoButton);
                        panel.appendChild(clearButton);
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
    } else {
        // Çizim durdurulduğunda
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const panel = document.getElementById('control-panel');
                const canvas = document.getElementById('webdraw-canvas');
                if (panel) panel.style.display = 'none';
                if (canvas) canvas.style.display = 'none';
                localStorage.setItem('isDrawingActive', 'false');
            }
        });
    }

    // Durum değiştirilir
    isDrawingActive = !isDrawingActive;
});
