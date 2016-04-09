((App) => {
    'use strict';

    App.run(function($rootScope, Auth, Client) {
        $rootScope.client = null;
        $rootScope.user = null;

        Auth.auth().then((credentials) => new Promise((resolve, reject) => {
            var client = new Client(credentials.id, credentials.token);
            client.auth().then((user) => {
                resolve([client, user]);
            }, (e) => {
                reject('Could not authenticate: ' + e)
            });
        })).then(([client, user]) => {
            $rootScope.client = client;
            $rootScope.user = user;
            $rootScope.$apply();
        });
    });
})(App);
