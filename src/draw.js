if (!window.webDrawInitialized) {
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
  let currentPath = [];
  let drawHistory = JSON.parse(localStorage.getItem('drawHistory')) || [];
  let redoHistory = [];
  let currentShape = 'freeform'; // Şekil türü: 'freeform', 'circle', 'square', 'triangle', 'arrow'
  let startX, startY;

  // Çizime başlama fonksiyonu
  function startDrawing(e) {
    drawing = true;
    startX = e.clientX;
    startY = e.clientY;
    currentPath = [{ x: e.clientX, y: e.clientY }];
    redoHistory = [];
  }

  // Çizim fonksiyonu
  function draw(e) {
    if (!drawing) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redraw(); // Önceki çizimleri yeniden çiz

    ctx.strokeStyle = localStorage.getItem('currentColor') || '#FF0000';
    ctx.lineWidth = localStorage.getItem('currentThickness') || 3;

    if (currentShape === 'freeform') {
      currentPath.push({ x: e.clientX, y: e.clientY });
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    } else if (currentShape === 'circle') {
      const radius = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (currentShape === 'square') {
      ctx.beginPath();
      ctx.rect(startX, startY, e.clientX - startX, e.clientY - startY);
      ctx.stroke();
    } else if (currentShape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.lineTo(2 * startX - e.clientX, e.clientY);
      ctx.closePath();
      ctx.stroke();
    } else if (currentShape === 'arrow') {
      drawArrow(ctx, startX, startY, e.clientX, e.clientY, ctx.lineWidth);
    }
  }

  // Ok çizim fonksiyonu
  function drawArrow(context, fromx, fromy, tox, toy, thickness) {
    const headlen = Math.max(20, thickness *4); // Ok başının uzunluğunu kalınlığa göre ayarla
    const angle = Math.atan2(toy - fromy, tox - fromx);

    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.stroke();

    context.beginPath();
    context.moveTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    );

    context.lineTo(tox, toy);

    context.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    );
    context.stroke();
  }

  // Çizimi bitirme fonksiyonu
// Çizimi bitirme fonksiyonu
function stopDrawing(e) {
  if (!drawing) return;
  drawing = false;
  
  if (currentShape !== 'freeform') {
      drawHistory.push({
          shape: currentShape,
          points: [{ x: startX, y: startY }, { x: e.clientX, y: e.clientY }],
          color: localStorage.getItem('currentColor') || '#FF0000',
          width: localStorage.getItem('currentThickness') || 3,
          startX,
          startY,
      });
      localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
      // currentShape = 'freeform'; // Bu satırı kaldırıyoruz, böylece kullanıcı şekil değiştirmedikçe seçili şekil aynı kalır.
  } else {
      if (currentPath.length > 0) {
          drawHistory.push({
              shape: currentShape,
              points: currentPath,
              color: localStorage.getItem('currentColor') || '#FF0000',
              width: localStorage.getItem('currentThickness') || 3,
          });
          localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
      }
  }
  currentPath = [];
}


  // Çizimleri yeniden çizme fonksiyonu
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHistory.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;

      if (path.shape === 'freeform' && path.points && path.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        path.points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      } else if (path.shape === 'circle' && path.points && path.points.length > 1) {
        const radius = Math.sqrt(Math.pow(path.points[1].x - path.startX, 2) + Math.pow(path.points[1].y - path.startY, 2));
        ctx.beginPath();
        ctx.arc(path.startX, path.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (path.shape === 'square' && path.points && path.points.length > 1) {
        ctx.beginPath();
        ctx.rect(path.startX, path.startY, path.points[1].x - path.startX, path.points[1].y - path.startY);
        ctx.stroke();
      } else if (path.shape === 'triangle' && path.points && path.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(path.startX, path.startY);
        ctx.lineTo(path.points[1].x, path.points[1].y);
        ctx.lineTo(2 * path.startX - path.points[1].x, path.points[1].y);
        ctx.closePath();
        ctx.stroke();
      } else if (path.shape === 'arrow' && path.points && path.points.length > 1) {
        drawArrow(ctx, path.startX, path.startY, path.points[1].x, path.points[1].y, path.width);
      }
    });
  }

  // Şekil seçme butonları oluşturma
// Şekil seçme butonları oluşturma
function createShapeButtons() {
  const shapes = [
      { name: 'Freeform', value: 'freeform', icon: 'icons/draw-16.png' }, // Kalem ikonu
      { name: 'Circle', value: 'circle', icon: 'icons/circle.png' },
      { name: 'Square', value: 'square', icon: 'icons/square.png' },
      { name: 'Triangle', value: 'triangle', icon: 'icons/triangle.png' },
      { name: 'Arrow', value: 'arrow', icon: 'icons/arrow.png' }
  ];

  const shapeContainer = document.createElement('div');
  shapeContainer.id = 'shape-container';
  shapeContainer.style.display = 'flex';
  shapeContainer.style.gap = '5px';

  shapes.forEach(shape => {
      const shapeButton = document.createElement('button');
      shapeButton.style.background = `url(${chrome.runtime.getURL(shape.icon)}) no-repeat center`;
      shapeButton.style.backgroundSize = 'contain';
      shapeButton.style.width = '25px';
      shapeButton.style.height = '25px';
      shapeButton.style.border = 'none';
      shapeButton.style.cursor = 'pointer';
      shapeButton.title = shape.name;
      shapeButton.dataset.shape = shape.value; // Her buton için veri attribute ekle
      shapeButton.addEventListener('click', () => {
          currentShape = shape.value;
          updateActiveShape(shapeButton);
      });
      shapeContainer.appendChild(shapeButton);
  });

  document.getElementById('control-panel').appendChild(shapeContainer);
}

// Aktif şekli güncelleyen fonksiyon
function updateActiveShape(activeButton) {
  // Tüm butonların aktif sınıfını kaldır
  document.querySelectorAll('#shape-container button').forEach(button => {
      button.classList.remove('active-shape');
  });

  // Seçili butona aktif sınıfını ekle
  activeButton.classList.add('active-shape');
}

// Şekil butonlarının stilini güncelleme
const style = document.createElement('style');
style.innerHTML = `
  .active-shape {
      border: 2px solid #fff; /* Seçili butonun etrafında beyaz bir sınır */
      background-color: rgba(255, 255, 255, 0.2); /* Hafif bir arka plan rengi */
  }
`;
document.head.appendChild(style);

// Varsayılan olarak Freeform'un seçili olmasını sağla
document.addEventListener('DOMContentLoaded', () => {
  const defaultButton = document.querySelector('button[data-shape="freeform"]');
  if (defaultButton) {
      updateActiveShape(defaultButton);
  }
});


  // Favori renk butonlarını oluşturma
  function createFavoriteColorButtons() {
    chrome.storage.sync.get('favColors', ({ favColors }) => {
      const colors = favColors || ['#FF0000', '#00FF00', '#0000FF'];
      const colorContainer = document.createElement('div');
      colorContainer.id = 'color-container';
      colorContainer.style.display = 'flex';
      colorContainer.style.gap = '5px';

      colors.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.style.background = color;
        colorButton.style.width = '30px';
        colorButton.style.height = '30px';
        colorButton.style.border = '2px solid #fff';
        colorButton.style.borderRadius = '50%';
        colorButton.style.cursor = 'pointer';
        colorButton.addEventListener('click', () => {
          localStorage.setItem('currentColor', color);
        });
        colorContainer.appendChild(colorButton);
      });

      document.getElementById('control-panel').appendChild(colorContainer);
    });
  }

  // Geri al, ileri al ve temizleme fonksiyonları
  function undoLastDraw() {
    if (drawHistory.length === 0) return;
    const lastDraw = drawHistory.pop();
    redoHistory.push(lastDraw);
    localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
    redraw();
  }

  function redoLastDraw() {
    if (redoHistory.length === 0) return;
    const lastRedo = redoHistory.pop();
    drawHistory.push(lastRedo);
    localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
    redraw();
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHistory = [];
    redoHistory = [];
    localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
  }

  // Kontrol paneli oluşturma
  if (!document.getElementById('control-panel')) {
    const panel = document.createElement('div');
    panel.id = 'control-panel';

    document.body.appendChild(panel);
    createShapeButtons(); // Şekil butonları panelden sonra ekleniyor
    createFavoriteColorButtons(); // Favori renk butonları panelden sonra ekleniyor

    const undoRedoContainer = document.createElement('div');
    undoRedoContainer.id = 'undo-redo-container';

    const undoButton = document.createElement('button');
    undoButton.classList.add('action-button', 'small');
    const undoIcon = document.createElement('img');
    undoIcon.src = chrome.runtime.getURL('icons/undo.png');
    undoButton.appendChild(undoIcon);

    const redoButton = document.createElement('button');
    redoButton.classList.add('action-button', 'small');
    const redoIcon = document.createElement('img');
    redoIcon.src = chrome.runtime.getURL('icons/redo.png');
    redoButton.appendChild(redoIcon);

    const clearButton = document.createElement('button');
    clearButton.id = 'clear-button';
    clearButton.classList.add('action-button');
    const clearIcon = document.createElement('img');
    clearIcon.src = chrome.runtime.getURL('icons/clear.png');
    clearIcon.classList.add('clear-icon');
    clearButton.appendChild(clearIcon);

    undoButton.addEventListener('click', () => window.dispatchEvent(new Event('undoDrawing')));
    redoButton.addEventListener('click', () => window.dispatchEvent(new Event('redoDrawing')));
    clearButton.addEventListener('click', () => window.dispatchEvent(new Event('clearCanvas')));

    undoRedoContainer.appendChild(undoButton);
    undoRedoContainer.appendChild(redoButton);

    panel.appendChild(undoRedoContainer);
    panel.appendChild(clearButton);

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
    colorPicker.value = '#FF0000';

    const thicknessInput = document.createElement('input');
    thicknessInput.type = 'range';
    thicknessInput.min = '1';
    thicknessInput.max = '20';
    thicknessInput.value = localStorage.getItem('currentThickness') || '3';

    dropdownMenu.appendChild(colorPicker);
    dropdownMenu.appendChild(thicknessInput);

    dropdownButton.addEventListener('click', () => {
      if (dropdownMenu.style.display === 'flex') {
        dropdownMenu.style.display = 'none';
        dropdownButton.classList.remove('open');
        dropdownButton.classList.add('close');
      } else {
        dropdownMenu.style.display = 'flex';
        dropdownButton.classList.remove('close');
        dropdownButton.classList.add('open');
      }
    });

    colorPicker.addEventListener('input', () => {
      localStorage.setItem('currentColor', colorPicker.value);
    });

    thicknessInput.addEventListener('input', () => {
      localStorage.setItem('currentThickness', thicknessInput.value);
    });

    panel.appendChild(dropdownButton);
    panel.appendChild(dropdownMenu);
  }

  // Event listener’lar ekleniyor
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  window.addEventListener('resize', handleResize);
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
  const panel = document.getElementById('control-panel');
  if (canvas) canvas.style.display = 'none';
  if (panel) panel.style.display = 'none';
}
