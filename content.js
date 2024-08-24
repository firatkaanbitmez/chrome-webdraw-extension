if (!document.getElementById('webdraw-canvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'webdraw-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '10000';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('draw.js');
    document.body.appendChild(script);
}
