if (typeof window.webDrawInitialized === 'undefined') {
    var canvas = document.getElementById('webdraw-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'webdraw-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '10000';
        canvas.style.pointerEvents = 'auto';
        canvas.style.cursor = 'crosshair';
        document.body.appendChild(canvas);
    } else {
        canvas.style.display = 'block'; // Canvas'ı tekrar göster
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

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

    // Artık canvas ve gerekli ayarların tanımlandığını işaretliyoruz.
    window.webDrawInitialized = true;

    // Çizim durumu başladığında durumu localStorage'a kaydediyoruz.
    localStorage.setItem('isDrawingActive', 'true');
} else {
    // Eğer canvas zaten tanımlandıysa, sadece görünür hale getiriyoruz.
    const canvas = document.getElementById('webdraw-canvas');
    if (canvas) {
        canvas.style.display = 'block';
    }
}

// Eğer sayfa yenilendiğinde çizim devam ediyorsa, durdurulması için kontrol sağlıyoruz.
if (localStorage.getItem('isDrawingActive') === 'true') {
    const canvas = document.getElementById('webdraw-canvas');
    if (canvas) {
        canvas.style.display = 'block';
    }
} else {
    // Eğer çizim durdurulmuşsa, canvas gizlenir.
    const canvas = document.getElementById('webdraw-canvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
}
