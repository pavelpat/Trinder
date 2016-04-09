(($, App) => {
    'use strict';

    App.factory('Client', function(UserModel, PersonModel, UpdateModel) {
        return class Client {
            constructor(fbId, fbToken) {
                this.fbId = fbId;
                this.fbToken = fbToken;
                this.apiUrl = 'https://api.gotinder.com/';
                this.authToken = null;
            }

            auth() {
                return this._post('auth', {
                    'facebook_id': this.fbId,
                    'facebook_token': this.fbToken
                }).then((r) => {
                    this.authToken = r.token;
                    return new UserModel(r.user);
                });
            }

            meta() {
                return new Promise((resolve, reject) => {
                    reject('Not implemented');
                });
            }

            ping() {
                return new Promise((resolve, reject) => {
                    reject('Not implemented');
                });
            }

            user(id) {
                return this._get('user/' + id).then((response) => {
                    return new PersonModel(response.results);
                });
            }

            pass(id) {
                return this._get('pass/' + id);
            }

            like(id) {
                return this._get('like/' + id);
            }

            recs() {
                return this._get('user/recs').then((response) => {
                    return response.results.map((person) => new PersonModel(person));
                });
            }

            send(id, message) {
                return this._post('user/matches/' + id, {
                    'message': message
                });
            }

            updates(since) {
                return this._post('updates', {
                    'last_activity_date': since.toISOString()
                }).then((result) => new UpdateModel(result));
            }

            _get(path) {
                var headers = {
                    'Content-Type': 'application/json'
                };
                if (this.authToken) {
                    headers['X-Auth-Token'] = this.authToken;
                }

                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + path,
                        type: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': this.authToken
                        }
                    }).success((r) => {
                        resolve(r);
                    }).error((e) => {
                        reject('Bad response: ' + e);
                    });
                });
            }

            _post(path, data) {
                var headers = {
                    'Content-Type': 'application/json'
                };
                if (this.authToken) {
                    headers['X-Auth-Token'] = this.authToken;
                }

                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + path,
                        type: 'post',
                        headers: headers,
                        data: JSON.stringify(data)
                    }).success((s) => {
                        resolve(s);
                    }).error((e) => {
                        reject('Bad response: ' + e);
                    });
                });
            }
        }
    });
})(jQuery, App);
