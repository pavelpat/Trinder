((chrome, App) => {
    'use strict';

    App.factory('Store', () => {
        return class {
            constructor(space) {
                this.space = space;
            }

            expand(key) {
                return this.space + '-' + key;
            }

            get(key) {
                key = this.expand(key);
                return new Promise((resolve) => {
                    chrome.storage.local.get(key, (items) => {
                        resolve(items[key])
                    });
                });
            }

            set(key, value) {
                var values = {};
                values[this.expand(key)] = value;
                return new Promise((resolve) => {
                    chrome.storage.local.set(values, () => {
                        resolve();
                    });
                });
            }

            remove(key) {
                return new Promise((resolve) => {
                    chrome.storage.local.remove(this.expand(key), () => {
                        resolve();
                    })
                });
            }
        };
    });
})(chrome, App);
