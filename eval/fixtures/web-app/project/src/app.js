const { renderCard } = require('./card');

function renderPage(cards) {
  if (!Array.isArray(cards)) throw new Error('cards must be an array');
  return `<!doctype html><main>${cards.map(renderCard).join('')}</main>`;
}

module.exports = { renderPage };
