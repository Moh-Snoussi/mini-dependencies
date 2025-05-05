import Question from "./Question.js";

export default class BaseComponent {
    static inst;
    /**
     * @type {HTMLElement}
     */
    container;


    constructor(componentId) {
        this.container = document.querySelector(`[data-component-id='${componentId}']`);
        this.questionService = Question;
        this.loaded();
    }

    getTemplate(tempateName, replaceMap = {}) {
        let template = this.container.querySelector(`[data-component-template="${this.constructor.name + '-' + tempateName}"]`);
        if (!template) return;

        let el = this.fragmentToHtml(template.content.cloneNode(true));
        for (const [key, value] of Object.entries(replaceMap)) {
            el.innerHTML = this.replace(el.innerHTML, { [key]: value });
        }

        return el;
    }

    loaded() {
        console.log(`Edit this method in ${this.constructor.name} class`);
    }

    fire(eventName, detail) {
        this.container.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    subscribe(eventName, callback) {
        BaseComponent.inst.container.addEventListener(eventName, callback);
    }

    fragmentToHtml(fragment) {
        const temp = document.createElement("div");
        temp.appendChild(fragment.cloneNode(true));
        return temp;
    }

    replace(content, replaceMap) {

        for (const [key, value] of Object.entries(replaceMap)) {
            content = content.replace(new RegExp(key, "g"), value);
        }
        return content;
    }

    addToQueryParams(key, value, reload = false) {
        const url = new URL(window.location); // Parse the current URL
        url.searchParams.set(key, value); // Add or update the query parameter

        if (reload) {
            // Reload the page with the updated URL
            window.location.href = url;
        } else {
            // Update the URL without reloading
            window.history.pushState({}, '', url);
        }
    }

    async getConfig(key) {
        const config =  JSON.parse(window.localStorage.getItem('config'));

        if (!config || !config[key]) {
            const configRes = await fetch('config.json');
            if (!configRes.ok) {
                throw new Error('Failed to fetch config');
            }
            const config = await configRes.json();
            window.localStorage.setItem('config', JSON.stringify(config));
        }

        return config[key] ?? null;
    }

    async getPublicPath(name, queryParams = {}) {
        let basePath = await this.getConfig('basePath');
        basePath = this.trim(basePath, '/');
        name = this.trim(name, '/');
        let url = '';
        if (basePath === '') {
            url = new URL(`http://localhost:3000/${name}`);
        } else {
            url = new URL(`http://localhost:3000/${basePath}/${name}`);
        }

        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });

        // only return full path without the host and port
        return url.pathname + url.search;
    }

    /**
     * Left and right trim a string
     */
    trim(url, char = '/') {
        return url.replace(new RegExp(`^${char}+|${char}+$`, 'g'), '');
    }

}
