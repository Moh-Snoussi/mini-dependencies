// reloadManager.js
import fs from "fs";
import path from "path";
import { readFileIfExists } from "./utils.js";

export class ReloadManager {
  constructor(outDir) {
    this.outDir = outDir;
    this.clients = [];
  }

  register(res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    this.clients.push(res);
  }

  trigger() {
    this.clients.forEach(res => res.write("data: reload\n\n"));
    this.clients = [];
  }

  injectReloadScript() {
    const reloadScript = `<script>
      const evt = new EventSource('/__reload__');
      evt.onmessage = () => location.reload();
    </script>`;

    fs.readdirSync(this.outDir).forEach(file => {
      if (file.endsWith(".html")) {
        const filePath = path.join(this.outDir, file);
        let html = readFileIfExists(filePath);
        if (!html.includes("/__reload__")) {
          html = html.replace(/<\/body>/, `${reloadScript}</body>`);
          fs.writeFileSync(filePath, html, "utf-8");
        }
      }
    });
  }
}
