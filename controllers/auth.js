(function (chrome, $, App, Client) {
    'use strict';

    App.controller('AuthController', function ($rootScope) {
        $rootScope.auth = null;
        $rootScope.client = null;
        $rootScope.person = null;
        $rootScope.clientReady = new Promise(function (resolve, reject) {
            authorize().then(credentials).then(connect).then(function (cp) {
                $rootScope.auth = true;
                $rootScope.client = cp.client;
                $rootScope.person = cp.person;
                $rootScope.$apply();
                resolve();
            }, function (e) {
                $rootScope.auth = false;
                $rootScope.$apply();
                reject('Connection error: ' + e);
            });
        });
    });

    function authorize() {
        return new Promise(function (resolve, reject) {
            // Send request to TrinderAuth.
            chrome.runtime.sendMessage({
                type: 'request'
            });

            // Wait response from TrinderAuth.
            chrome.runtime.onMessage.addListener(function (message) {
                if (message.type != 'response') {
                    return;
                }
                
                resolve(message.token, message.expires);
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
