// htmlBuilder.js
import fs from "fs";
import path from "path";
import { ComponentLoader } from "./ComponentLoader.js";
import { copyDir, findFiles, readFileIfExists } from "./utils.js";
import { Logger } from "./Logger.js";
import { JSDOM } from 'jsdom';

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
    this.runTests();
    fs.readdirSync(this.publicDir).forEach(file => {
      if (file.endsWith(".html")) {
        const input = path.join(this.publicDir, file);
        const output = path.join(this.outDir, file);
        this.buildHTML(input, output, prod);
      }
    });
  }

  /**
   * Tests are any file that ends with .test.js
   * They will run automatically when the build is run
   */
  async runTests() {
    // recursively find all .test.js files in srcDir
    const testFiles = findFiles(this.srcDir, ".test.mjs");

    const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
    global.document = window.document;

    for (const testFile of testFiles) {
      let baseName = path.basename(testFile);
      try {
        const testModule = await import(testFile);
        if (testModule.default) {
          const test = testModule.default;
          if (typeof test === "function") {
            console.log(`[TEST] ${baseName} started`);
            await test();
            console.log(`[TEST] ${baseName} finished`);
          } else {
            console.warn(`[TEST] ${baseName} is not a function`);
          }
        } else {
          console.warn(`[TEST] ${baseName} has no default export`);
        }
      } catch (error) {
        Logger.error(`[TEST] ${baseName} failed:\n\n ${error.message}`, 'error');
        Logger.error(error.stack);
      }
    }
  }

  copyToOutDir(srcPath) {
    if (!fs.existsSync(this.outDir)) {
      fs.mkdirSync(this.outDir, { recursive: true });
    }

    if (!fs.existsSync(srcPath)) {
      console.warn(`Source path does not exist: ${srcPath}`);
      return; // Exit if the source path no longer exists
    }

    const assetRPath = path.relative(this.publicDir, srcPath);
    const destPath = path.join(this.outDir, assetRPath);

    if (fs.lstatSync(srcPath).isDirectory()) {
      // Recursively copy directory
      fs.mkdirSync(destPath, { recursive: true });
      fs.readdirSync(srcPath).forEach(child => {
        this.copyToOutDir(path.join(srcPath, child));
      });
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);
    }
  }

}
