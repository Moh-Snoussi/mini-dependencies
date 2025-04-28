// utils.js
import fs from "fs";
import path from 'path';
import os from "os";
import { execSync } from "child_process";

export function readFileIfExists(filepath) {
  return fs.existsSync(filepath) ? fs.readFileSync(filepath, "utf-8") : "";
}

export function scopeCss(css, scopeID) {
  return css.replace(/(^|\})\s*([^\{\}]+)\s*\{/g, (_, end, selector) => {

    if (selector.trim().startsWith('@')) {
      return `${end} ${selector} {`; // Skip scoping for @keyframes or similar
    }

    // check if start with a number and then a % sign or from, to, or calc
    if (/^\d+%/|/^from|to|calc/.test(selector.trim())) {
      return `${end} ${selector} {`; // Skip scoping for percentage selectors
    }

    // allow :root and :host
    if (/^(:root|:host)/.test(selector.trim())) {
      return `${end} ${selector} {`; // Skip scoping for :root or :host
    }


    const scoped = selector
      .split(',')
      .map(s => `[data-component-id="${scopeID}"] ${s.trim()}`)
      .join(', ');
    return `${end} ${scoped} {`;
  });
}

export function capitalize(str) {
  let str1 = str.charAt(0).toUpperCase() + str.slice(1);
  // "-" to Uppercase foo-bar => FooBar
  str1 = str1.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  return str1;
}

export function readFilesreplace(replaceMap, ...filePths) {
  return filePths.map(file => {
    let content = readFileIfExists(file);
    for (const [key, value] of Object.entries(replaceMap)) {
      content = content.replace(new RegExp(key, "g"), value);
    }
    return content;
  });
}

export async function copyDir(src, dest) {

  fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src, { withFileTypes: true }).forEach(entry => {

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  })
}

export function copyDirNReplace(replaceMap, src, dest) {
  return new Promise((resolve, reject) => {
    if (typeof src !== 'string' || typeof dest !== 'string') {
      return reject(new TypeError('The "src" and "dest" arguments must be of type string.'));
    }

    fs.mkdir(dest, { recursive: true }, err => {
      if (err) return reject(err);
      fs.readdir(src, (err, files) => {
        if (err) return reject(err);
        let pending = files.length;
        if (!pending) return resolve();
        files.forEach(file => {
          const srcPath = path.join(src, file);
          const destPath = path.join(dest, file);
          fs.stat(srcPath, (err, stat) => {
            if (err) return reject(err);
            if (stat && stat.isDirectory()) {
              copyDirNReplace(replaceMap, srcPath, destPath).then(() => {
                if (!--pending) resolve();
              }).catch(reject);
            } else {
              let content = readFileIfExists(srcPath);
              for (const [key, value] of Object.entries(replaceMap)) {
                content = content.replace(new RegExp(key, "g"), value);
              }
              fs.writeFile(destPath, content, err => {
                if (err) return reject(err);
                if (!--pending) resolve();
              });
            }
          });
        });
      });
    });
  });
}

export function getLocalIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  return ips;
}


export function findFiles(dir, ext) {
  const files = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  });
  return files;
}

