// componentLoader.js (class-based)
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { minify } from "html-minifier";
import jsBeautify from 'js-beautify';
import { readFileIfExists, scopeCss, capitalize, readFilesreplace } from "./utils.js";

const { html: beautifyHtml } = jsBeautify;
import { JSDOM } from 'jsdom';


export class ComponentLoader {

  static COMPONENTS_DIR = 'components';
  static counter = {};

  constructor(srcDir, outDir) {
    this.srcDir = srcDir;
    this.outDir = outDir;
    let __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.defaultsDir = path.join(__dirname, "..", "defaults");
  }

  injectComponents(html, prod, parents = [], fileName = "") {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const allComponents = [...document.querySelectorAll('[data-component]')];
    const topLevelComps = allComponents.filter(el => !el.closest('[data-component]:not(:scope)'));

    topLevelComps.forEach((el, i) => {
      const comp = el.getAttribute('data-component');
      const scopedClass = `component-${comp}`;

      const parentDir = path.join(this.srcDir, ...parents);
      let compPath = path.join(parentDir, comp);
      el.classList.add(scopedClass);
      if (!ComponentLoader.counter[comp]) {
        ComponentLoader.counter[comp] = 0;
      }
      const compId = `${comp}-${++ComponentLoader.counter[comp]}`;
      el.setAttribute('data-component-id', compId);

      if (!(comp in ComponentLoader.counter)) {
        ComponentLoader.counter[comp] = 0;
      }

      let routeName = "";
      let outCompPath = path.join(this.outDir, ComponentLoader.COMPONENTS_DIR, ...parents, comp, routeName);
      this.scaffoldComponent(comp, compPath, fileName);

      let usePage = false;
      if (fileName.endsWith(".comp.html")) {
        // a component is a html file with its own html, css and js
        this.addToLoader(comp, compPath, fileName);
      }
      if (!fileName.endsWith("index.html")) {
        // non index component, resolves to the same name as the current page
        // a welcome component in a play.html resolves to /components/play/welcome/welcome.html
        routeName = fileName.replace(/\.html$/, "");
        if (fs.existsSync(path.join(compPath, routeName))) {
          compPath = path.join(compPath, routeName);
          outCompPath = path.join(outCompPath, routeName);
          usePage = true;
        }
      }
      console.log('compPath:', compPath, 'outCompPath:', outCompPath);

      let templates = [];

      const allHtmls = fs.readdirSync(compPath).filter(f => f.endsWith(".html"));
      allHtmls.forEach(file => {
        const content = readFileIfExists(path.join(compPath, file));
        if (file === `${comp}.html`) {
          templates.push(this.injectComponents(content, prod, [...parents, comp]));
        } else {
          const name = path.basename(file, ".html");
          templates.push(`<template data-component-template-id="${capitalize(comp) + capitalize(compId)}" data-component-template="${capitalize(comp) + '-' + name}">${content}</template>`);
        }
      });

      let compHtml = el.innerHTML + templates.join("");
      const compCssRaw = readFileIfExists(path.join(compPath, `${comp}.css`));
      const compJs = readFileIfExists(path.join(compPath, `${comp}.js`));


      fs.mkdirSync(outCompPath, { recursive: true });
      fs.writeFileSync(path.join(outCompPath, `${comp}.js`), compJs);

      const scopedCss = compCssRaw ? scopeCss(compCssRaw, compId) : "";
      const styleTag = scopedCss ? `<style>${scopedCss}</style>` : "";

      let clientImportPath = path.join('/', ComponentLoader.COMPONENTS_DIR, ...parents, comp, routeName, `${comp}.js`);
      if (!usePage) {
        clientImportPath = path.join('/', ComponentLoader.COMPONENTS_DIR, ...parents, comp, `${comp}.js`);
      }

      const scriptTag = compJs ? `<script>
      import("${clientImportPath}").then(mod => {
        if (mod.default) new mod.default('${compId}');
        });
        </script>` : "";

      compHtml = this.injectComponents(compHtml, prod, [...parents, comp]);

      let resultHtml = `\n${styleTag}\n${compHtml}\n${scriptTag}`;

      resultHtml = prod
        ? minify(resultHtml, { collapseWhitespace: true, removeComments: true })
        : beautifyHtml(resultHtml, { indent_size: 2, max_preserve_newlines: 0 });

      el.innerHTML = resultHtml;
    });
    // replace multiple newlines with single newline
    return dom.serialize().replace(/\n{3,}/g, "\n\n");
  }

  scaffoldComponent(compName, compPath, pageName) {
    if (pageName !== 'index.html') {
      let routeName = path.basename(pageName, ".html");
      let compSubPath = path.join(compPath, routeName);
      if (fs.existsSync(compSubPath)) {
        // only scaffold if a page component is already created
        compPath = compSubPath;
      }
    }

    if (!fs.existsSync(compPath)) {
      fs.mkdirSync(compPath, { recursive: true });
      // check if ./../BaseComponent.js exists
      const baseComponentDest = path.join(this.srcDir, "BaseComponent.js");
      if (!fs.existsSync(baseComponentDest)) {
        // write BaseComponent.js to srcDir
        fs.writeFileSync(baseComponentDest, readFileIfExists(path.join(this.defaultsDir, "BaseComponent.js")));
      }

      // replace __COMPONENT_NAME__ with compName and __COMPONENT_PATH__ with comPath
      const htmlDefaultPath = path.join(this.defaultsDir, "default.html");
      const cssDefaultPath = path.join(this.defaultsDir, "default.css");
      const jsDefaultPath = path.join(this.defaultsDir, "default.js");
      console.log('htmlDefaultPath:', htmlDefaultPath);
      console.log('cssDefaultPath:', cssDefaultPath);
      console.log('jsDefaultPath:', jsDefaultPath);
      let [html, css, js] = readFilesreplace({
        "__COMPONENT_NAME__": compName,
        "__COMPONENT_PATH__": compPath,
        "__COMPONENTS_PATH__": ComponentLoader.COMPONENTS_DIR,
        "__CLASS_NAME__": capitalize(compName)
      }, htmlDefaultPath, cssDefaultPath, jsDefaultPath);

      fs.writeFileSync(path.join(compPath, `${compName}.html`), html);
      fs.writeFileSync(path.join(compPath, `${compName}.css`), css);
      fs.writeFileSync(path.join(compPath, `${compName}.js`), js);

      console.log('scaffolded component:', compName);
    }
  }

  buildComponentDir() {
    // create components directory
    const componentsDir = path.join(this.outDir, ComponentLoader.COMPONENTS_DIR);
    fs.mkdirSync(componentsDir, { recursive: true });
    // include BaseComponent
    const baseComponentSrc = path.join(this.srcDir, "BaseComponent.js");
    const baseComponentDistPath = path.join(componentsDir, "BaseComponent.js");
    // write BaseComponent.js to outDir
    if (fs.existsSync(baseComponentSrc)) {
      const contents = fs.readFileSync(baseComponentSrc, "utf-8");
      fs.writeFileSync(baseComponentDistPath, contents, "utf-8");
      console.log('created baseComponent.js', baseComponentDistPath);
    }
  }
}
