let isDrawingActive = false;

chrome.action.onClicked.addListener((tab) => {
  isDrawingActive = !isDrawingActive;

  if (isDrawingActive) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["draw.js"]
    }, () => {
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["styles/panel.css"]
      });
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: stopDrawingMode
    });
  }
});

function stopDrawingMode() {
  const canvas = document.getElementById('webdraw-canvas');
  const panel = document.getElementById('control-panel');

  if (canvas) {
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseout', stopDrawing);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('undoDrawing', undoLastDraw);
    window.removeEventListener('redoDrawing', redoLastDraw);
    window.removeEventListener('clearCanvas', clearCanvas);
    document.body.removeChild(canvas);
  }

  if (panel) {
    document.body.removeChild(panel);
  }

  localStorage.setItem('isDrawingActive', 'false');
  window.webDrawInitialized = false; // Çizim modunun sıfırlandığından emin olun
}
