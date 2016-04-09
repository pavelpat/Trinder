((App) => {
    'use strict';

    App.run(function($rootScope, Auth, Client, Geo, SettingsStore) {
        $rootScope.client = null;
        $rootScope.user = null;

        Auth.auth().then((credentials) => new Promise((resolve, reject) => {
            var client = new Client(credentials.id, credentials.token);
            client.auth().then((user) => {
                geolocation(client).then(() => {
                    resolve([client, user]);
                });
            }, (e) => {
                reject('Could not authenticate: ' + e)
            });
        })).then(([client, user]) => {
            $rootScope.client = client;
            $rootScope.user = user;
            $rootScope.$apply();
        });

        function geolocation(client) {
            return new Promise((resolve) => {
                SettingsStore.settings.then((settings) => {
                    if (settings.geolocation) {
                        // Browser selected location.
                        Geo().then(([geolat, geolon]) => {
                            client.ping(geolat, geolon).then(() => {
                                resolve();
                            });
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
})(App);
