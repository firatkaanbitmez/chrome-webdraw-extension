document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-select');
  
    // Load the saved theme preference
    chrome.storage.sync.get('theme', ({ theme }) => {
      themeSelect.value = theme || 'dark';
    });
  
    // Save the theme when the selection changes
    themeSelect.addEventListener('change', () => {
      const selectedTheme = themeSelect.value;
      chrome.storage.sync.set({ theme: selectedTheme });
    });
  });
  