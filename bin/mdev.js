#!/usr/bin/env node

// mdev.js - Executes the main entry point
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// if --help is passed, show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: mdev [options]');
  console.log('Watch and build the project into the dist folder');
  console.log('Options:');
  console.log('  --help, -h    Show this help message');
  process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mainEntry = resolve(__dirname, '../src/index.mjs');

const child = spawn('node', [mainEntry, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
});
