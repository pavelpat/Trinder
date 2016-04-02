((chrome, App) => {
    'use strict';

    App.value('Store', class {
        constructor(space) {
            this.space = space;
        }

        get(key) {
            key = this._expand(key);
            return new Promise((resolve) => {
                chrome.storage.local.get(key, (items) => {
                    resolve(items[key])
                });
            });
        }

        set(key, value) {
            var values = {};
            values[this._expand(key)] = value;
            return new Promise((resolve) => {
                chrome.storage.local.set(values, () => {
                    resolve();
                });
            });
        }

        remove(key) {
            return new Promise((resolve) => {
                chrome.storage.local.remove(this._expand(key), () => {
                    resolve();
                })
            });
        }

        _expand(key) {
            return this.space + '-' + key;
        }
    });
})(chrome, App);
