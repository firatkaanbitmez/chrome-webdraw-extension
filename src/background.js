let isDrawingActive = false;
let notificationCooldown = false; // Bildirim cooldown durumu

chrome.action.onClicked.addListener((tab) => {
  // chrome:// URL'leri kontrol ederek bu tür sayfalarda kod çalıştırmayı engelle
  if (tab.url.startsWith('chrome://')) {
    triggerNotification('This extension cannot run on chrome:// URLs.');
    return;
  }

  isDrawingActive = !isDrawingActive;

  if (isDrawingActive) {
    activateDrawingMode(tab.id);
  } else {
    deactivateDrawingMode(tab.id);
  }
});

function activateDrawingMode(tabId) {
  chrome.storage.sync.get('theme', ({ theme }) => {
    const cssFile = theme === 'light' ? 'styles/panel-light.css' : 'styles/panel.css';
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["draw.js"]
    })
    .then(() => {
      return chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: [cssFile]
      });
    })
    .catch(error => {
      console.error(error);
      triggerNotification('Failed to activate drawing mode.');
    });
  });
}


function deactivateDrawingMode(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: stopDrawingMode
  }).catch(error => {
    console.error(error);
    triggerNotification('Failed to deactivate drawing mode.');
  });
}

function stopDrawingMode() {
  const canvas = document.getElementById('webdraw-canvas');
  const panel = document.getElementById('control-panel');

  if (canvas) {
    canvas.remove();
  }

  if (panel) {
    panel.remove();
  }

  localStorage.setItem('isDrawingActive', 'false');
  window.webDrawInitialized = false;
}

function triggerNotification(message) {
  if (notificationCooldown) return;

  showErrorNotification(message);
  notificationCooldown = true;

  setTimeout(() => {
    notificationCooldown = false;
  }, 5000);
}

function showErrorNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/draw-128.png'),
    title: 'WebDraw Error',
    message: message,
    priority: 2
  });
}
