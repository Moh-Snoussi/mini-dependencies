import BaseComponent from '/components/BaseComponent.js';

export default class Welcome extends BaseComponent {
    constructor(container) {
        super(container);
    }

    loaded() {
        console.log('Welcome loaded');
    }
}
