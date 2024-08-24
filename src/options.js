document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme-select');
  const colorPickers = document.querySelectorAll('#fav-colors input[type="color"]');

  // Debounce fonksiyonu
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Saved settings yükleniyor
  chrome.storage.sync.get(['theme', 'favColors'], ({ theme, favColors }) => {
    themeSelect.value = theme || 'dark';
    if (favColors) {
      colorPickers.forEach((picker, index) => {
        picker.value = favColors[index] || picker.value;
      });
    }
  });

  // Tema seçim ayarlarını kaydet
  themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;
    chrome.storage.sync.set({ theme: selectedTheme });
  });

  // Favori renkleri kaydet (Debounce ile)
  const saveColors = debounce(() => {
    const favColors = Array.from(colorPickers).map(picker => picker.value);
    chrome.storage.sync.set({ favColors });
  }, 500); // 500ms bekleme süresi

  colorPickers.forEach((picker) => {
    picker.addEventListener('input', saveColors);
  });
});
