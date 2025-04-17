import BaseComponent from '/components/BaseComponent.js';

export default class Footer extends BaseComponent {
    constructor(container) {
        super(container);
        this.themeColor = document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
        this.container.style.backgroundColor = this.themeColor;
    }

    loaded() {
        console.log('Footer loaded');
    }
}
