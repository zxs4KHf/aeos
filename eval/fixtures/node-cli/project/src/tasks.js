function normalizeTitle(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('task title is required');
  return value.trimStart();
}

function formatTask(task) {
  if (!task || typeof task.done !== 'boolean') throw new Error('task.done must be a boolean');
  return `[${task.done ? 'x' : ' '}] ${normalizeTitle(task.title)}`;
}

module.exports = { formatTask, normalizeTitle };
