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

  function startDrawing(e) {
    drawing = true;
    currentPath = [{ x: e.clientX, y: e.clientY }];
    redoHistory = [];
  }

  function draw(e) {
    if (!drawing) return;

    ctx.strokeStyle = localStorage.getItem('currentColor') || '#FF0000';
    ctx.lineWidth = localStorage.getItem('currentThickness') || 3;
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

  function stopDrawing() {
    if (!drawing) return;
    drawing = false;
    if (currentPath.length > 0) {
      drawHistory.push({
        points: currentPath,
        color: localStorage.getItem('currentColor') || '#FF0000',
        width: localStorage.getItem('currentThickness') || 3
      });
      localStorage.setItem('drawHistory', JSON.stringify(drawHistory));
    }
    currentPath = [];
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

  // Event listener’lar ekleniyor
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  window.addEventListener('resize', handleResize);
  window.addEventListener('undoDrawing', undoLastDraw);
  window.addEventListener('redoDrawing', redoLastDraw);
  window.addEventListener('clearCanvas', clearCanvas);

  // Kontrol paneli oluşturma
  if (!document.getElementById('control-panel')) {
    const panel = document.createElement('div');
    panel.id = 'control-panel';

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
    clearButton.id = 'clear-button'; // Clear butonuna ID eklendi
    clearButton.classList.add('action-button');
    const clearIcon = document.createElement('img');
    clearIcon.src = chrome.runtime.getURL('icons/clear.png');
    clearIcon.classList.add('clear-icon'); // CSS’te daha kolay yönetmek için class eklendi
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

    document.body.appendChild(panel);
  }

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