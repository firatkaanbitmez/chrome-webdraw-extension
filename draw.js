if (typeof window.webDrawInitialized === 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.id = 'webdraw-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        pointer-events: auto;
        cursor: crosshair;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let drawing = false;
    let lastX = 0, lastY = 0;

    function draw(e) {
        if (!drawing) return;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        [lastX, lastY] = [e.clientX, e.clientY];
    }

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        [lastX, lastY] = [e.clientX, e.clientY];
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseout', () => drawing = false);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.webDrawInitialized = true;
    localStorage.setItem('isDrawingActive', 'true');
} else {
    const canvas = document.getElementById('webdraw-canvas');
    if (canvas) canvas.style.display = 'block';
}

if (localStorage.getItem('isDrawingActive') !== 'true') {
    const canvas = document.getElementById('webdraw-canvas');
    if (canvas) canvas.style.display = 'none';
}
