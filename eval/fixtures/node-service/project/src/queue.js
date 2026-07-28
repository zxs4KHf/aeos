function createQueue() {
  const jobs = [];
  return {
    enqueue(job) {
      if (!job || typeof job.id !== 'string' || !job.id.trim()) throw new Error('job id is required');
      jobs.push({ ...job });
      return jobs.length;
    },
    next() {
      return jobs.shift() || null;
    },
    size() {
      return jobs.length;
    }
  };
}

module.exports = { createQueue };
