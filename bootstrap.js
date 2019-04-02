((App, window) => {
    'use strict';

    App.run(function($rootScope, Auth, Client, Geo, SettingsStore) {
        $rootScope.client = null;
        $rootScope.user = null;
        $rootScope.located = null;

        Auth.auth().then((credentials) => new Promise((resolve, reject) => {
            let client = new Client(credentials.id, credentials.token);
            client.auth().then((user) => {
                // Export client for DevTools debug.
                window.client = client;
                resolve([client, user]);
            }, (e) => {
                reject('Could not authenticate: ' + e)
            });
        })).then((args) => {
            let client = args[0],
                user = args[1];

            return new Promise((resolve) => {
                geolocation(client).then(() => {
                    // Current geo location sent.
                    resolve([client, user, true]);
                }, (reason) => {
                    // Current geo location not sent, but this must not breaks page load.
                    // If location not sent we must show warning popup to user.
                    console.warn('Could not set initial position: ' + reason.message);

                    resolve([client, user, false]);
                });
            });
        }).then((args) => {
            let client = args[0],
                user = args[1],
                located = args[2];
            $rootScope.client = client;
            $rootScope.user = user;
            $rootScope.located = located;
            $rootScope.$apply();
        });

        function geolocation(client) {
            /**
             * Detects your current location or pickups it from settings.
             * Sends your current location to the tinder api.
             */
            return new Promise((resolve, reject) => {
                SettingsStore.settings.then((settings) => {
                    if (settings.geolocation) {
                        // Browser selected location.
                        Geo.position().then((args) => {
                            let geolat = args[0],
                                geolon = args[1];
                            client.ping(geolat, geolon).then(() => {
                                resolve();
                            });
                        }, (reason) => {
                            reject(reason);
                        });
                    } else if (settings.geolat && settings.geolon) {
                        // User selected location.
                        client.ping(settings.geolat, settings.geolon).then(() => {
                            resolve();
                        });
                    }
                });
            });
        }
    });
})(App, window);
