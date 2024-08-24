let isDrawingActive = false;
let isNotificationShown = false; // Notification state variable

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.startsWith('chrome://')) {
    // If the notification is already shown, do not show it again
    if (isNotificationShown) return;

    // Show the notification
    const notificationId = 'webdraw-notification';
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icons/draw-48.png',
      title: 'WebDraw Alert',
      message: 'WebDraw cannot be used on this page.',
      priority: 2
    });

    // Mark the notification as shown
    isNotificationShown = true;

    // Automatically clear the notification after 5 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId, () => {
        // Allow showing the notification again after it is cleared
        isNotificationShown = false;
      });
    }, 5000);

    return; // Stop further execution for chrome:// pages
  }

  // Continue with normal execution if not a chrome:// page
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

// Clear the notification when clicked
chrome.notifications.onClicked.addListener((notificationId) => {
  // Clear the clicked notification
  chrome.notifications.clear(notificationId);
  // Reset notification state when it is cleared by clicking
  isNotificationShown = false;
});

// Function to stop drawing mode
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
  window.webDrawInitialized = false; // Ensure drawing mode is reset
}
