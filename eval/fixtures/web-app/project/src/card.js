function escapeText(value) {
  return String(value)
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderCard({ title, description = '' }) {
  if (typeof title !== 'string' || !title.trim()) throw new Error('card title is required');
  return `<article class="card"><h2>${escapeText(title)}</h2><p>${escapeText(description)}</p></article>`;
}

module.exports = { escapeText, renderCard };
