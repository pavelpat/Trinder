((App) => {
    'use strict';

    App.run(function($rootScope, Auth, Client) {
        $rootScope.client = null;
        $rootScope.person = null;

        Auth.auth().then((credentials) => new Promise((resolve, reject) => {
            var client = new Client(credentials.id, credentials.token);
            client.auth().then((person) => {
                resolve([client, person]);
            }, (e) => {
                reject('Could not authenticate: ' + e)
            });
        })).then(([client, person]) => {
            $rootScope.client = client;
            $rootScope.person = person;
            $rootScope.$apply();
        });
    });
})(App);
