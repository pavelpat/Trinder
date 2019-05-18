(($, App) => {
    'use strict';

    App.factory('Auth', (Store, Echo) => {
        return new class {
            constructor() {
                this.store = new Store('Auth');
            }
            
            /**
             * Authorizes in facebook and returns fb auth token.
             * @return {Promise<string>}
             * @throws {Error}
             */
            async auth() {
                let token = null;
    
                try {
                    token = await this._cached();
                } catch (e) {
                    token = await this._authorize();
                }

                return await this._credentials(token);
            }

            /**
             * @return {Promise<string>}
             * @throws {Error}
             */
            async _cached() {
                let token = await this.store.get('token');

                if (!token || token.expiresAt <= Date.now()) {
                    await this.store.remove('token');
                    throw new Error('Token miss or expired');
                }

                return token.token;
            }
            
            /**
             * @return {Promise<string>}
             */
            async _authorize() {
                let bgWorkerData = await Echo(null);

                await this.store.set('token', {
                    expiresAt: bgWorkerData.expires * 1000 + Date.now(),
                    token: bgWorkerData.token
                });

                return bgWorkerData.token;
            }
            
            /**
             * @param {string} token
             * @return {Promise<object>}
             * @throws {Error}
             */
            async _credentials(token) {
                let credentials = await new Promise((resolve, reject) => {
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
                            name: response.name
                        });
                    }, () => {
                        reject('Could not access Facebook profile info');
                    });
                });

                return {
                    id: credentials.id,
                    name: credentials.name,
                    token: token
                }
            }
        }();
    });
})(jQuery, App);
