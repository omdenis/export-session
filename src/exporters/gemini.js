// Gemini exporter. Gemini has no simple JSON endpoint, but the full
// conversation lives in the DOM, so we scrape it directly (no scrolling).
window.__aiExport = async () => {
  const S = window.__aiExportShared;

  const clean = el => {
    // strip inline source chips / footnotes that pollute innerText
    const c = el.cloneNode(true);
    c.querySelectorAll('sources-carousel-inline, source-footnote, source-inline-chip')
      .forEach(n => n.remove());
    return c.innerText.replace(/\n{3,}/g, '\n\n').trim();
  };

  const msgs = [];
  document.querySelectorAll('.conversation-container').forEach(turn => {
    const u = turn.querySelector('user-query-content .query-text, user-query .query-text');
    if (u) {
      const lines = [...u.querySelectorAll('.query-text-line')]
        .map(l => l.innerText).join('\n').trim() || u.innerText.trim();
      if (lines) msgs.push({ role: 'user', text: lines });
    }
    const r = turn.querySelector('message-content .markdown');
    if (r) {
      const text = clean(r);
      const labelEl = turn.querySelector('.bot-name-text');
      const label = labelEl ? labelEl.innerText.trim() : 'Gemini';
      if (text) msgs.push({ role: 'assistant', text, label });
    }
  });

  // conversation id: /app/<id>
  const idMatch = location.pathname.match(/\/app\/([0-9a-z]+)/i);
  const convId = idMatch ? idMatch[1] : '';
  const url = convId ? `${location.origin}/app/${convId}` : location.href;

  // title: sidebar active item, else document title
  const active = document.querySelector(
    'conversations-list .is-active .title-text, conversations-list [aria-current="page"] .title-text');
  let title = active ? active.innerText.trim()
    : (document.title || 'Gemini chat').replace(/\s*[-|]\s*Gemini\s*$/i, '').trim();
  if (!title) title = 'Gemini chat';

  // model: mode switcher pill (Flash / Pro / etc.)
  const modeEl = document.querySelector('bard-mode-switcher .picker-primary-text');
  const model = modeEl ? `Gemini ${modeEl.innerText.trim()}` : 'Gemini';

  return S.finish({
    title,
    model,
    created: '',            // Gemini exposes no per-conversation timestamp
    url,
    source: 'gemini',
    assistantLabel: 'Gemini',
    tags: ['ai-session', 'gemini']
  }, msgs);
};
