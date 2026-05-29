// ChatGPT exporter. Pulls the conversation tree from the backend API
// (exact per-message dates, model, title), no scrolling needed.
window.__aiExport = async () => {
  const S = window.__aiExportShared;

  const idMatch = location.pathname.match(/\/c\/([0-9a-f-]{36})/i);
  if (!idMatch) return 'No conversation id in URL. Open a saved chat.';
  const convId = idMatch[1];

  const sess = await fetch('/api/auth/session').then(r => r.json());
  const token = sess && sess.accessToken;
  if (!token) return 'Not logged in (no access token).';

  const data = await fetch(`/backend-api/conversation/${convId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => {
    if (!r.ok) throw new Error('backend-api ' + r.status);
    return r.json();
  });

  // linear path: walk current_node up to root, then reverse
  const mapping = data.mapping;
  const path = [];
  let node = data.current_node;
  while (node && mapping[node]) {
    const m = mapping[node];
    if (m.message) path.push(m.message);
    node = m.parent;
  }
  path.reverse();

  const models = new Set();
  const msgs = [];

  for (const m of path) {
    if (!m || !m.author || !m.content) continue;
    const role = m.author.role;
    if (role !== 'user' && role !== 'assistant') continue;
    if (m.metadata && m.metadata.is_visually_hidden_from_conversation) continue;
    if (m.content.content_type !== 'text') continue;
    const text = (m.content.parts || [])
      .filter(p => typeof p === 'string').join('\n').trim();
    if (!text) continue;
    if (m.metadata && m.metadata.model_slug) models.add(m.metadata.model_slug);
    msgs.push({ role, text, when: S.fmtDateTime(m.create_time) });
  }

  return S.finish({
    title: (data.title || 'ChatGPT chat').trim(),
    model: [...models].join(', '),
    created: S.fmtDate(data.create_time),
    url: `${location.origin}/c/${convId}`,
    source: 'chatgpt',
    assistantLabel: 'ChatGPT',
    tags: ['ai-session', 'chatgpt']
  }, msgs);
};
