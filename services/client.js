(($, App) => {
    'use strict';

    App.value('Client', class {
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
                return {
                    name: r.user.full_name,
                    bio: r.user.bio
                };
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

        pass(id) {
            return this._get('pass/' + id);
        }

        like(id) {
            return this._get('like/' + id);
        }

        recs() {
            return this._get('user/recs').then((r) => {
                return r.results.map((r) => {
                    return {
                        id: r._id,
                        name: r.name,
                        bio: r.bio,
                        birthDate: r.birth_date,
                        photos: r.photos.map((photo) => {
                            var photos = {
                                url: photo.url
                            };
                            photo.processedFiles.forEach((photo) => {
                                photos[photo.width] = {
                                    width: photo.width,
                                    height: photo.height,
                                    url: photo.url
                                }
                            });

                            return photos;
                        })
                    };
                });
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
            }).then((r) => ({
                lastActivity: r.last_activity_date,
                matches: r.matches.map((match) => {
                    return {
                        id: match._id,
                        person: match.person ? {
                            id: match.person._id,
                            name: match.person.name,
                            bio: match.person.bio,
                            birthDate: match.person.birth_date,
                            photos: match.person.photos.map((photo) => {
                                var photos = {
                                    url: photo.url
                                };
                                photo.processedFiles.forEach((photo) => {
                                    photos[photo.width] = {
                                        width: photo.width,
                                        height: photo.height,
                                        url: photo.url
                                    }
                                });

                                return photos;
                            })
                        } : null,
                        messages: match.messages.map((message) => {
                            return {
                                to: message.to,
                                from: message.from,
                                message: message.message,
                                sent: message.sent_date
                            };
                        }),
                        lastActivity: match.last_activity_date
                    };
                })
            }));
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
    });

    App.factory('ReadyClient', (Auth, Client) => {
        return Auth.auth().then((credentials) => {
            return new Promise((resolve, reject) => {
                var client = new Client(credentials.id, credentials.token);
                client.auth().then((person) => {
                    resolve({
                        client: client,
                        person: person
                    });
                }, (e) => {
                    reject('Could not authenticate: ' + e)
                });
            });
        });
    });
})(jQuery, App);
