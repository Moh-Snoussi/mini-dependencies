#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { readFileIfExists, copyDirNReplace } from "../src/utils.js";

let appName = process.argv[2];
let root = process.cwd();
const currentFileDir = path.dirname(new URL(import.meta.url).pathname);
console.log(`Current file directory: ${currentFileDir}`);
const defaultsDir = path.join(currentFileDir, '..', 'defaults');

// check if help is requested
if (appName === '--help' || appName === '-h') {
  console.log(`
Usage: create-web-app [project-name]
Creates a new web app project.
Options:
  project-name  The name of the project. If not provided, the current directory will be used.
  --help, -h    Show this help message.
Examples:
  create-web-app my-app
  create-web-app
`);
  process.exit(0);
}

console.log(`Creating web app in ${root}`);

if (!appName) {
  process.stdout.write("⚠️  No project name given. This will install into the current directory. Continue? (y/N): ");
  const response = await new Promise(resolve => process.stdin.once('data', d => resolve(d.toString().trim())));
  if (response.toLowerCase() !== 'y') {
    console.log("❌ Cancelled.");
    process.exit(1);
  }
  appName = path.basename(root);
} else {
  root = path.resolve(process.cwd(), appName);
  if (fs.existsSync(root)) {
    console.log(`❌ Directory '${appName}' already exists.`);
    process.exit(1);
  }
  fs.mkdirSync(root);
}

// Create src dir structure
fs.mkdirSync(path.join(root, 'src'));

copyDirNReplace(
  {
    'APP_NAME': appName,
  },
  path.join(defaultsDir, 'public'), path.join(root, 'public')
).then(() => {
  console.log(`✅ Created src directory structure`);
});
