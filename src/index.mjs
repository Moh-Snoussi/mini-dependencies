#!/usr/bin/env node

// index.mjs - Main entry point
import { config } from "./Config.js";
import { HTMLBuilder } from "./HtmlBuilder.js";
import { ReloadManager } from "./ReloadManager.js";
import { DevServer } from "./DevServer.js";

const reloadManager = new ReloadManager(config.outDir);

const builder = new HTMLBuilder({
  srcDir: config.srcDir,
  publicDir: config.publicDir,
  outDir: config.outDir,
  onRebuild: () => reloadManager.trigger()
});

const prod = process.argv.includes("--prod");

builder.cleanOutputDir();
builder.buildAll(prod);

if (!prod) {
  reloadManager.injectReloadScript();
}

const server = new DevServer(config.outDir, reloadManager, config.port, config.host);
server.start();

server.watch([config.srcDir, config.publicDir], (eventName, pth) => {
  // if pth is a public/ non-html file copy it to outDir
  if (pth.startsWith(config.publicDir) && !pth.endsWith(".html")) {
    builder.copyToOutDir(pth);
  }
  builder.buildAll();

  if (!prod) {
    reloadManager.injectReloadScript();
  }
});

if (prod) {
  server.close();
  process.exit(0);
}
