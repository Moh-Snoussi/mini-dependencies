import BaseComponent from '/components/BaseComponent.js';

export default class TopBar extends BaseComponent {

    menuItem = [{
        label: 'Home',
        href: '#home',
        title: 'Home',
    },
    {
        label: 'Play',
        href: 'play.html',
        title: 'Play',
    },
    {
        label: 'Services',
        href: '#services',
        title: 'Services',
    },
    {
        label: 'Contact',
        href: '#contact',
        title: 'Contact',

    },
    ];

    constructor(container) {
        super(container);
        this.menu = this.container.querySelector('[data-top-bar-list]');
        this.menuContainer = this.container.querySelector('[data-top-bar-menu]');
        this.logo = this.container.querySelector('[data-logo]');
        this.toggleButton = this.container.querySelector('.menu-toggle');
        this.menuTemplate = this.container.querySelector('[data-top-bar-menu-template]');

        this.setMenuItems(...this.menuItem);
        this.registerInstallation(this.logo)
        this.setLogo('/assets/icons/mda.svg');

        this.toggleButton.addEventListener('click', () => this.toggleMenu());
    }

    registerInstallation(installBtn) {
        let deferredPrompt = null;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); // Prevent auto-prompt
            deferredPrompt = e;

            installBtn.addEventListener('click', () => {
                installBtn.style.display = 'none';
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(choiceResult => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA installation accepted');
                    } else {
                        console.log('PWA installation dismissed');
                    }
                    deferredPrompt = null;
                });
            });
        });
    }

    loaded() {
        console.log('Top-bar loaded');
    }

    toggleMenu() {
        const isOpen = this.menuContainer.classList.toggle('open');
        this.toggleButton.textContent = isOpen ? '✖' : '☰';
    }

    setLogo(logoUrl) {
        this.logo.style.backgroundImage = `url(${logoUrl})`;
    }

    setMenuItems(...items) {
        items.forEach(item => {
            const menuContent = this.menuTemplate.content.cloneNode(true);
            const link = menuContent.querySelector('a');
            link.innerHTML = item.label;
            if (item.href) {
                link.setAttribute('href', item.href);
            }
            if (item.title) {
                link.setAttribute('title', item.title);
            }

            this.menu.appendChild(menuContent);
        });
    }
}
