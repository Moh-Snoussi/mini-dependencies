#!/usr/bin/env node

// mdev.js - Executes the main entry point
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mainEntry = resolve(__dirname, '../src/index.mjs');

const child = spawn('node', [mainEntry, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
});
