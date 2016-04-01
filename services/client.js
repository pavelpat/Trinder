(($, App) => {
    'use strict';

    App.factory('Client', () => {
        return class {
            constructor(fbId, fbToken) {
                this.fbId = fbId;
                this.fbToken = fbToken;
                this.apiUrl = 'https://api.gotinder.com/';
                this.authToken = null;
            }

            auth() {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + 'auth',
                        type: 'post',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify({
                            'facebook_id': this.fbId,
                            'facebook_token': this.fbToken
                        })
                    }).success((r) => {
                        this.authToken = r.token;
                        resolve({
                            name: r.user.full_name,
                            bio: r.user.bio
                        });
                    }).error(() => {
                        this.authToken = null;
                        reject('Bad response');
                    });
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
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + 'pass/' + id,
                        type: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': this.authToken
                        }
                    }).success(() => {
                        resolve(true);
                    }).error(() => {
                        reject('Bad response');
                    });
                });
            }

            like(id) {
                return new Promise((resolve, reject) => {
                    if (!this.authToken) {
                        reject('Not authenticated')
                    }
                    $.ajax({
                        url: this.apiUrl + 'like/' + id,
                        type: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': this.authToken
                        }
                    }).success((r) => {
                        resolve(r.match);
                    }).error(() => {
                        reject('Bad response');
                    });
                });
            }

            recs() {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + 'user/recs',
                        type: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': this.authToken
                        }
                    }).success((r) => {
                        resolve(r.results.map((r) => {
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
                        }));
                    }).error(() => {
                        reject('Bad response');
                    });
                });
            }

            send(id, message) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + 'user/matches/' + id,
                        type: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': this.authToken
                        },
                        data: JSON.stringify({
                            'message': message
                        })
                    }).success(() => {
                        resolve(true);
                    }).error(() => {
                        reject('Bad response');
                    });
                });
            }

            updates(since) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + 'updates',
                        type: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': this.authToken
                        },
                        data: JSON.stringify({
                            'last_activity_date': since.toISOString()
                        })
                    }).success((r) => {
                        resolve({
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
                        });
                    }).error(() => {
                        reject('Bad response');
                    });
                });
            }
        };
    });
})(jQuery, App);
