(($, App) => {
    'use strict';

    App.factory('Auth', (Store, Echo) => {
        return new class {
            constructor() {
                this.store = new Store('Auth');
            }
            
            auth() {
                return this._cached().catch(
                    this._authorize.bind(this)
                ).then(
                    this._credentials.bind(this)
                )
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
                return Echo(null).then((data) => {
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
        }();
    });
})(jQuery, App);
