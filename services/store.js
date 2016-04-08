((chrome, App) => {
    'use strict';

    App.value('Store', class Store {
        constructor(space) {
            this.space = space;
        }

        /**
         * @param {string} key
         * @returns {Promise}
         */
        get(key) {
            key = this._expand(key);
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(key, (items) => {
                    if (items.hasOwnProperty(key)) {
                       resolve(items[key]);
                    } else {
                        reject();
                    }
                });
            });
        }

        /**
         * @param {string} key
         * @param {*} value
         * @returns {Promise}
         */
        set(key, value) {
            var values = {};
            values[this._expand(key)] = value;
            return new Promise((resolve) => {
                chrome.storage.local.set(values, () => {
                    resolve();
                });
            });
        }

        /**
         * @param {string} key
         * @returns {Promise}
         */
        remove(key) {
            return new Promise((resolve) => {
                chrome.storage.local.remove(this._expand(key), () => {
                    resolve();
                })
            });
        }

        /**
         * @returns {Promise}
         */
        static clear() {
            return new Promise((resolve) => {
                chrome.storage.local.clear(() => {
                    resolve();
                })
            });
        }

        _expand(key) {
            return this.space + '-' + key;
        }
    });
})(chrome, App);
