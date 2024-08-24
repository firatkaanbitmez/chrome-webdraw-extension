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
    let currentPath = []; // O an çizilen çizginin noktaları
    let drawHistory = JSON.parse(localStorage.getItem('drawHistory')) || [];
    let redoHistory = []; // Redo için bir geçmiş ekliyoruz

    function draw(e) {
        if (!drawing) return;

        ctx.strokeStyle = localStorage.getItem('currentColor') || '#FF0000';
        ctx.lineWidth = localStorage.getItem('currentThickness') || 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        currentPath.push({ x: e.clientX, y: e.clientY });

        ctx.beginPath();
        if (currentPath.length > 1) {
            const previousPoint = currentPath[currentPath.length - 2];
            ctx.moveTo(previousPoint.x, previousPoint.y);
        } else {
            ctx.moveTo(e.clientX, e.clientY);
        }
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHistory.forEach((path) => {
            if (Array.isArray(path.points) && path.points.length > 0) {
                ctx.strokeStyle = path.color;
                ctx.lineWidth = path.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                for (let i = 1; i < path.points.length; i++) {
                    ctx.moveTo(path.points[i - 1].x, path.points[i - 1].y);
                    ctx.lineTo(path.points[i].x, path.points[i].y);
                    ctx.stroke();
                }
            }
        });
    }

    function undoLastDraw() {
        if (drawHistory.length === 0) return;
        const lastDraw = drawHistory.pop(); // Son çizimi çıkar
        redoHistory.push(lastDraw); // Redo için kaydet
        localStorage.setItem('drawHistory', JSON.stringify(drawHistory)); // Güncel geçmişi kaydet
        redraw();
    }

    function redoLastDraw() {
        if (redoHistory.length === 0) return;
        const lastRedo = redoHistory.pop(); // Redo çizimini geri al
        drawHistory.push(lastRedo); // Çizim geçmişine ekle
        localStorage.setItem('drawHistory', JSON.stringify(drawHistory)); // Güncel geçmişi kaydet
        redraw();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHistory = []; // Çizim geçmişini sıfırla
        redoHistory = []; // Redo geçmişini sıfırla
        localStorage.setItem('drawHistory', JSON.stringify(drawHistory)); // Güncel geçmişi kaydet
    }

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        currentPath = [{ x: e.clientX, y: e.clientY }];
        redoHistory = []; // Yeni çizim başladığında redo geçmişini sıfırla
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drawing) draw(e);
    });

    canvas.addEventListener('mouseup', () => {
        if (!drawing) return;
        drawing = false;
        if (currentPath.length > 0) {
            drawHistory.push({
                points: currentPath,
                color: localStorage.getItem('currentColor') || '#FF0000',
                width: localStorage.getItem('currentThickness') || 5
            });
            localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
        }
        currentPath = [];
    });

    canvas.addEventListener('mouseout', () => {
        if (drawing) {
            drawing = false;
            if (currentPath.length > 0) {
                drawHistory.push({
                    points: currentPath,
                    color: localStorage.getItem('currentColor') || '#FF0000',
                    width: localStorage.getItem('currentThickness') || 5
                });
                localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
            }
            currentPath = [];
        }
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw();
    });

    window.addEventListener('undoDrawing', undoLastDraw);
    window.addEventListener('redoDrawing', redoLastDraw);
    window.addEventListener('clearCanvas', clearCanvas);

    window.webDrawInitialized = true;
    localStorage.setItem('isDrawingActive', 'true');
    redraw();
} else {
    const canvas = document.getElementById('webdraw-canvas');
    if (canvas) canvas.style.display = 'block';
}

if (localStorage.getItem('isDrawingActive') !== 'true') {
    const canvas = document.getElementById('webdraw-canvas');
    if (canvas) canvas.style.display = 'none';
}
