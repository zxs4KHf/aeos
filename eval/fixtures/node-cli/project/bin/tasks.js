#!/usr/bin/env node
const { formatTask } = require('../src/tasks');

const done = process.argv.includes('--done');
const title = process.argv.filter((argument) => !argument.startsWith('--')).slice(2).join(' ') || 'Untitled';
console.log(formatTask({ title, done }));
