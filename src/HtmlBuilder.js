// htmlBuilder.js
import fs from "fs";
import path from "path";
import { ComponentLoader } from "./ComponentLoader.js";
import { copyDir, readFileIfExists } from "./utils.js";

export class HTMLBuilder {
  constructor({ srcDir, publicDir, outDir, onRebuild }) {
    this.srcDir = srcDir;
    this.publicDir = publicDir;
    this.outDir = outDir;
    this.onRebuild = onRebuild;
    this.loader = new ComponentLoader(this.srcDir, this.outDir);
  }

  buildComponentDir() {
    const componentsDir = path.join(this.outDir, ComponentLoader.COMPONENTS_DIR);
    fs.mkdirSync(componentsDir, { recursive: true });
    const baseComponentSrc = path.join(this.srcDir, "BaseComponent.js");
    const baseComponentDistPath = path.join(componentsDir, "BaseComponent.js");
    if (fs.existsSync(baseComponentSrc)) {
      const contents = readFileIfExists(baseComponentSrc);
      fs.writeFileSync(baseComponentDistPath, contents, "utf-8");
      console.log('created baseComponent.js', baseComponentDistPath);
    }
  }

  buildHTML(inputPath, outputPath, prod) {
    let html = readFileIfExists(inputPath);
    let fileName = path.basename(inputPath);
    html = this.loader.injectComponents(html, prod, [], fileName);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, "utf-8");
    console.log(`[build] ${outputPath}`);
    if (this.onRebuild) this.onRebuild();
  }

  cleanOutputDir() {
    if (fs.existsSync(this.outDir)) {
      fs.rmSync(this.outDir, { recursive: true, force: true });
    }

    // copy all from publicDir to outDir
    copyDir(this.publicDir, this.outDir);
  }

  buildAll(prod = false) {
    this.buildComponentDir();
    fs.readdirSync(this.publicDir).forEach(file => {
      if (file.endsWith(".html")) {
        const input = path.join(this.publicDir, file);
        const output = path.join(this.outDir, file);
        this.buildHTML(input, output, prod);
      }
    });
  }
}
