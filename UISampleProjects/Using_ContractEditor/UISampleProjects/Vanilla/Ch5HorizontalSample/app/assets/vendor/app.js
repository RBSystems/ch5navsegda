/*jslint es6 */
/*global document, window, XMLHttpRequest, CrComLib, event, translateModule, setTimeout, requestAnimationFrame, serviceModule */
var appModule = (function () {
    'use strict';
    /**
     * All public and local(prefix '_') properties
     */
    let triggerview = document.querySelector('.triggerview');
    let navbarThumb = document.querySelector('.swiper-thumb');
    let activeIndex = 0;
    let themeNav = document.getElementById('changeTheme');
    let appName = null;
    let appVersion = null;
    let errorClass = 'version-error';
    let previousActiveIndex = -1;
    let themeTimer;
    const NAV_PAGE_COUNT = 5; // Number of buttons in the navigation menu

    /**
     * This is public method to change the theme
     * @param {string} theme pass theme type like 'LIGHT', 'DARK'
     */
    function changeTheme(theme) {
        // add active class
        let current = themeNav.getElementsByClassName('active');
        if (current.length > 0) {
            current[0].className = current[0].className.replace(' active', '');
        }
        self.className += ' active';

        clearTimeout(themeTimer);
        themeTimer = setTimeout(function () {
            let body = document.body;
            let self;
            body.classList.remove('light-theme', 'dark-theme');
            let themeLink = themeNav.getElementsByClassName('btn-link');
            if (theme === 'LIGHT') {
                self = themeLink[0];
                body.classList.add('light-theme');
                CrComLib.publishEvent('s', 'ch5_brand', './assets/img/ch5-logo-light.png');
                CrComLib.publishEvent('s', 'common_background_url', './assets/img/ch5-stone-light-bg.jpg');
            } else {
                self = themeLink[1];
                body.classList.add('dark-theme');
                CrComLib.publishEvent('s', 'ch5_brand', './assets/img/ch5-logo-dark.png');
                CrComLib.publishEvent('s', 'common_background_url', './assets/img/ch5-stone-dark-bg.jpg');
            }
        }, 500);
    }

    /**
     * This is public method for bottom navigation to navigate to next page
     * @param {number} idx is current index for navigate to appropriate page
     */
    function addNavItemClickListener(idx) {
        let itemElem = document.querySelector('.thumb-btn-' + String(idx));
        if (itemElem) {
            itemElem.addEventListener('click', function () {
                if (triggerview !== null && idx !== activeIndex) {
                    triggerview.setActiveView(idx);
                    return;
                }
            });
        }
    }

    /**
     * Fetch app version info from menifest file.
     */
    function getAppVersionInfo() {
        serviceModule.loadJSON('./assets/data/app.manifest.json', function (response) {
            response = JSON.parse(response);
            appName = response.appName;
            appVersion = response.appVersion;
            let _appVersionEl = document.getElementById('appVersion');
            if (!!appName && !!appVersion) {
                let _successMessage = `${appName} version ${appVersion}`;
                if (!!_appVersionEl) {
                    _appVersionEl.classList.remove(errorClass);
                    _appVersionEl.innerHTML = _successMessage;
                }
            } else {
                if (!!_appVersionEl) {
                    _appVersionEl.classList.add(errorClass);
                    _appVersionEl.innerHTML = `Error: While fetching sample project version.`;
                }
            }
        });
    }

    /**
     * Display Crestron Component Library version information using
     * ch5-modal-dialog.
     */
    function versionInformation() {
        let _crComLibVersion = CrComLib.version;
        let _crComBuildDate = CrComLib.buildDate;
        let _versionEl = document.getElementById('versionDescription');
        if (!!_crComLibVersion && !!_crComBuildDate) {
            let _successMessage = `Crestron Component Library version ${_crComLibVersion} build date ${_crComBuildDate}`;
            if (!!_versionEl) {
                _versionEl.classList.remove(errorClass);
                _versionEl.innerHTML = _successMessage;
            }
        } else {
            if (!!_versionEl) {
                _versionEl.classList.add(errorClass);
                _versionEl.innerHTML = `Error: While fetching crestron component library version.`;
            }
        }
    }

    /**
     * This is public method for bottom navigation to set active state
     * @param {number} idx is current index for active state
     */
    function navActiveState(idx) {
        // If the previous and current index are same then return
        if (previousActiveIndex === idx) return;

        CrComLib.publishEvent('b', 'active_state_class_' + String(previousActiveIndex), false);
        if (activeIndex === idx) {
            previousActiveIndex = idx;
            CrComLib.publishEvent('b', 'active_state_class_' + String(idx), true);
        }
    }

    /**
     * This is public method for triggerview
     * @param {number} navItemSize is number of bottom navigation list
     */
    function triggerviewOnInit(navItemSize) {
        navItemSize = NAV_PAGE_COUNT;
        // storing active class index
        let storedActiveCls = document.querySelectorAll('.swiper-thumb .ch5-button');
        storedActiveCls.forEach(function (cls, navIdx) {
            if (cls.classList.contains('ch5-button--selected')) {
                navActiveState(navIdx);
            }
        });

        // on Init after language load
        if (navItemSize !== storedActiveCls.length) {
            CrComLib.publishEvent('n', 'nav.items.size', navItemSize);
            navActiveState(activeIndex);
        }
    }

    /**
     * This is public method to show language dropdown in smaller screen
     * @param {object} self is current element
     */
    function openLngMenu(self) {
        self.className += ' open';
        event.stopPropagation();
    }

    /**
     * This method will call till element is load
     */
    function rafAsync() {
        return new Promise(function (resolve) {
            requestAnimationFrame(resolve);
        });
    }

    /**
     * This method will return true if element loads
     * @param {string} selector is string of element, like class, id, tag name etc...
     */
    function checkElement(selector) {
        if (document.querySelector(selector) === null) {
            return rafAsync().then(() => checkElement(selector));
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * This is private method for add the class on targeted class element
     * @param {array} gatherElementsClass is array of class which you have to target.
     * @param {string} appendClass is class name which you have to add.
     */
    function addClassOnClick(gatherElementsClass, appendClass) {
        let elements = document.querySelectorAll(gatherElementsClass);
        if (elements) {
            elements.forEach(function (element) {
                element.addEventListener('click', function (e) {
                    e.currentTarget.classList.add(appendClass);
                    let myButton = e.currentTarget;
                    setTimeout(function () {
                        myButton.classList.remove(appendClass);
                    }, 1500);
                });
            });
        }
    }

    /**
     * This is public method to show/hide bottom navigation in smaller screen
     */
    function openThumbNav() {
        navbarThumb.className += ' open';
        event.stopPropagation();
    }

    /**
     * This method will invoke on body click
     */
    document.body.addEventListener('click', function (event) {
        translateModule.currentLng.classList.remove('open');
        navbarThumb.classList.remove('open');
    });

    /**
     * Load the emulator, theme, default language and listeners
     */
    function onLoadInit() {
        changeTheme('LIGHT');
        translateModule.getLanguage(translateModule.defaultLng);
        getAppVersionInfo();
        versionInformation();
        setTimeout(function () {
            for (let idx = 0; idx < NAV_PAGE_COUNT; idx++) {
                addNavItemClickListener(idx);
            }
        }, 1000);
        triggerview.addEventListener('select', function (event) {
            setTimeout(() => {
                activeIndex = event.detail;
                navActiveState(activeIndex);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', onLoadInit);

    /**
     * All public method and properties exporting here
     */
    return {
        changeTheme: changeTheme,
        triggerviewOnInit: triggerviewOnInit,
        openLngMenu: openLngMenu,
        openThumbNav: openThumbNav,
        checkElement: checkElement,
        addClassOnClick: addClassOnClick
    };

}());

/**
 * Loader method is for spinner
 */
function loader() {
    'use strict';
    let spinner = document.getElementById('loader');
    setTimeout(function () {
        spinner.style.display = 'none';
    }, 1000);
}

document.addEventListener('DOMContentLoaded', loader, false);