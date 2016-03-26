(function (chrome, $, App, Client) {
    'use strict';

    App.service('Auth', function(){
        var authPromise = null;

        this.singleAuth = function () {
            if (!authPromise) {
                authPromise = cache().catch(authorize).then(credentials).then(connect);
            }
            return authPromise;
        };
    });

    function cache() {
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get('token', function (items) {
                if (items.token && items.token.expiresAt > Date.now()) {
                    resolve(items.token.token);
                } else {
                    chrome.storage.local.remove('token');
                    reject();
                }
            });
        });
    }

    function authorize() {
        return new Promise(function (resolve, reject) {
            // Send request to background script.
            chrome.runtime.sendMessage({
                type: 'request'
            });

            // Wait response from background script.
            chrome.runtime.onMessage.addListener(function (message) {
                if (message.type != 'response') {
                    return;
                }

                // Cache token.
                chrome.storage.local.set({
                    token: {
                        expiresAt: message.expires * 1000 + Date.now(),
                        token: message.token
                    }
                });

                resolve(message.token);
            });
        });
    }

    function credentials(token, expires) {
        return new Promise(function (resolve, reject) {
            $.ajax('https://graph.facebook.com/v2.5/me', {
                data: {
                    'access_token': token
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            }).then(function (response) {
                resolve({
                    id: response.id,
                    token: token
                });
            }, function () {
                reject('Could not get profile info');
            });
        });
    }

    function connect(credentials) {
        return new Promise(function (resolve, reject) {
            var client = new Client(
                credentials.id,
                credentials.token
            );
            client.auth().then(function (person) {
                resolve({
                    client: client,
                    person: person
                });
            }, function (e) {
                reject('Could not authenticate: ' + e)
            });
        });
    }
})(chrome, jQuery, App, Client);
