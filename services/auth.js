(($, App) => {
    'use strict';

    App.factory('Auth', (Store, Echo, Client) => {
        return new class {
            constructor() {
                this.authPromise = null;
                this.store = new Store('Auth');
            }

            singleAuth() {
                if (!this.authPromise) {
                    this.authPromise = this._cached().catch(
                        this._authorize.bind(this)
                    ).then(
                        this._credentials.bind(this)
                    ).then(
                        this._connect.bind(this)
                    );
                }
                return this.authPromise;

            }

            _cached() {
                return this.store.get('token').then((token) => {
                    if (token && token.expiresAt > Date.now()) {
                        return token.token;
                    } else {
                        this.store.remove('token');
                        throw new Error('Token miss or expired');
                    }
                });
            }

            _authorize() {
                return Echo.send(null).then((data) => {
                    this.store.set('token', {
                        expiresAt: data.expires * 1000 + Date.now(),
                        token: data.token
                    });

                    return data.token;
                });
            }

            _credentials(token) {
                return new Promise((resolve, reject) => {
                    $.ajax('https://graph.facebook.com/v2.5/me', {
                        data: {
                            'access_token': token
                        },
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        }
                    }).then((response) => {
                        resolve({
                            id: response.id,
                            token: token
                        });
                    }, () => {
                        reject('Could not get profile info');
                    });
                });
            }

            _connect(credentials) {
                return new Promise((resolve, reject) => {
                    var client = new Client(
                        credentials.id,
                        credentials.token
                    );
                    client.auth().then((person) => {
                        resolve({
                            client: client,
                            person: person
                        });
                    }, (e) => {
                        reject('Could not authenticate: ' + e)
                    });
                });
            }
        }();
    });
})(jQuery, App);
