// server.js
import chokidar from "chokidar";
import express from "express";
import os from "os";
import path from "path";
import { getLocalIps } from "./utils.js";

export class DevServer {
  constructor(outDir, reloadManager, port, host) {
    this.outDir = outDir;
    this.reloadManager = reloadManager;
    this.port = port;
    this.host = host;
  }

  start() {
    const app = express();
    app.use(express.static(this.outDir));

    app.get("/__reload__", (_, res) => {
      this.reloadManager.register(res);
    });

    app.listen(this.port, this.host, () => {
      const ips = getLocalIps();
      console.log(`\n[serve] http://${this.host}:${this.port}`);
      ips.forEach(ip => console.log(`[serve] http://${ip}:${this.port}`));
    });
  }

  watch(watchPaths, onChange) {
    chokidar.watch(watchPaths, { ignoreInitial: true })
      .on("all", (eventName, pth) => onChange(eventName, pth));
  }
}
