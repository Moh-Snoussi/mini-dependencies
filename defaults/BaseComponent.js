export default class BaseComponent {
    static inst;
    /**
     * @type {HTMLElement}
     */
    container;


    constructor(componentId) {
        this.container = document.querySelector(`[data-component-id='${componentId}']`);
        this.container.style.setProperty('--hue', Math.floor(Math.random() * 360));

        if (!this.inst) {
            this.inst = this;
        }

        this.loaded();
    }

    getTemplate(tempateName) {
        let template = this.container.querySelector(`[data-component-template="${this.constructor.name + '-' + tempateName}"]`);
        if (template) return this.fragmentToHtml(template.content.cloneNode(true));
        return null;
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
        return temp.firstElementChild;
    }
}
