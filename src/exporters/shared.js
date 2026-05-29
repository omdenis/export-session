// Shared helpers for all site exporters. Runs in the page (ISOLATED world).
// Exposes window.__aiExportShared with formatting + download utilities.
window.__aiExportShared = (() => {
  const pad = n => String(n).padStart(2, '0');

  const fmtDateTime = ts => {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
      + `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const todayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const fmtDate = ts => (ts ? fmtDateTime(ts).slice(0, 10) : '');

  // header-only callout marker; message text stays plain below it
  const block = (type, titleLine, body) =>
    `> [!${type}] ${titleLine}\n\n${body}`;

  // meta: { title, model, created (date string or ''), url, source, assistantLabel, tags:[] }
  // msgs: [{ role:'user'|'assistant', text, when?, label? }]
  const finish = (meta, msgs) => {
    if (!msgs.length) return 'No messages found.';

    const created = meta.created || todayDate();
    const tags = (meta.tags && meta.tags.length)
      ? meta.tags : ['ai-session', meta.source];

    const fm = [
      '---',
      `title: "${(meta.title || 'AI chat').replace(/"/g, "'")}"`,
      `model: ${meta.model || 'unknown'}`,
      `created: ${created}`,
      `url: ${meta.url || ''}`,
      `source: ${meta.source}`,
      'tags:',
      ...tags.map(t => `  - ${t}`),
      '---',
      ''
    ].join('\n');

    const body = msgs.map(m => {
      const when = m.when ? ` · ${m.when}` : '';
      if (m.role === 'user') {
        return block('question', `**You**${when}`, m.text);
      }
      const who = m.label || meta.assistantLabel || 'Assistant';
      return block('note', `**${who}**${when}`, m.text);
    }).join('\n\n');

    const out = fm + '\n' + body + '\n';

    const safe = (meta.title || 'ai-chat')
      .replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80);
    const fname = `${created} ${safe}.md`;
    const blob = new Blob([out], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a); a.click(); a.remove();

    return `Done. ${msgs.length} messages.\n${fname}`;
  };

  return { fmtDateTime, fmtDate, todayDate, block, finish };
})();
