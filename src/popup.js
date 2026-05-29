const statusEl = document.getElementById('status');

const SITES = [
  { match: /chatgpt\.com|chat\.openai\.com/, file: 'exporters/chatgpt.js' },
  { match: /gemini\.google\.com/,            file: 'exporters/gemini.js' }
];

document.getElementById('go').addEventListener('click', async () => {
  statusEl.textContent = 'Working...';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const site = SITES.find(s => s.match.test(tab.url || ''));
  if (!site) {
    statusEl.textContent = 'Open a ChatGPT or Gemini chat first.';
    return;
  }

  try {
    // inject shared helpers + the site-specific exporter (defines window.__aiExport)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['exporters/shared.js', site.file]
    });
    // run it in the same isolated world and collect the status string
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.__aiExport()
    });
    statusEl.textContent = res.result || 'Done.';
  } catch (e) {
    statusEl.textContent = 'Error: ' + e.message;
  }
});
