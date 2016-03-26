/**
 * Currently Client access remote server with default Chrome User-Agent header.
 * It is impossible to work-around with Chrome XHR, but possible with raw tcp sockets.
 * See https://github.com/jarrodek/socket-fetch/.
 */
Client = (function ($) {
    'use strict';

    var Client = function (fbId, fbToken) {
        this.apiUrl = 'https://api.gotinder.com/';
        this.authToken = null;
        this.fbId = fbId;
        this.fbToken = fbToken;
    };

    Client.prototype.auth = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: self.apiUrl + 'auth',
                type: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    'facebook_id': self.fbId,
                    'facebook_token': self.fbToken
                })
            }).success(function (r) {
                self.authToken = r.token;
                resolve({
                    name: r.user.full_name,
                    bio: r.user.bio
                });
            }).error(function (r) {
                self.authToken = null;
                reject('Bad response');
            });
        });
    };

    Client.prototype.meta = function () {
        var self = this;
        return new Promise(function (resolve, reject){
            reject('Not implemented');
        });
    };

    Client.prototype.ping = function () {
        var self = this;
        return new Promise(function (resolve, reject){
            reject('Not implemented');
        });
    };

    Client.prototype.pass = function (id) {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (!self.authToken) {
                reject('Not authenticated')
            }
            $.ajax({
                url: self.apiUrl + 'pass/' + id,
                type: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': self.authToken
                }
            }).success(function (r) {
                resolve(true);
            }).error(function (r) {
                reject('Bad response');
            });
        });
    };

    Client.prototype.like = function (id) {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (!self.authToken) {
                reject('Not authenticated')
            }
            $.ajax({
                url: self.apiUrl + 'like/' + id,
                type: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': self.authToken
                }
            }).success(function (r) {
                resolve(r.match);
            }).error(function (r) {
                reject('Bad response');
            });
        });
    };

    Client.prototype.recs = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (!self.authToken) {
                reject('Not authenticated')
            }
            $.ajax({
                url: self.apiUrl + 'user/recs',
                type: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': self.authToken
                }
            }).success(function (r) {
                resolve(r.results.map(function (r) {
                    return {
                        id: r._id,
                        name: r.name,
                        bio: r.bio,
                        birthDate: r.birth_date,
                        photos: r.photos.map(function (photo) {
                            var photos = {
                                url: photo.url
                            };
                            photo.processedFiles.forEach(function (photo) {
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
            }).error(function (r) {
                reject('Bad response');
            });
        });
    };

    Client.prototype.send = function (id, message) {
        var self = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: self.apiUrl + 'user/matches/' + id,
                type: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': self.authToken
                },
                data: JSON.stringify({
                    'message': message
                })
            }).success(function (r) {
                resolve(true);
            }).error(function (r) {
                reject('Bad response');
            });
        });

    };

    Client.prototype.updates = function (since) {
        var self = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: self.apiUrl + 'updates',
                type: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': self.authToken
                },
                data: JSON.stringify({
                    'last_activity_date': since.toISOString()
                })
            }).success(function (r) {
                resolve({
                    lastActivity: r.last_activity_date,
                    matches: r.matches.map(function(match){
                        return {
                            id: match._id,
                            person: match.person ? {
                                id: match.person._id,
                                name: match.person.name,
                                bio: match.person.bio,
                                birthDate: match.person.birth_date,
                                photos: match.person.photos.map(function (photo) {
                                    var photos = {
                                        url: photo.url
                                    };
                                    photo.processedFiles.forEach(function (photo) {
                                        photos[photo.width] = {
                                            width: photo.width,
                                            height: photo.height,
                                            url: photo.url
                                        }
                                    });

                                    return photos;
                                })
                            } : null,
                            messages: match.messages.map(function (message) {
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
            }).error(function (r) {
                reject('Bad response');
            });
        });
    };

    return Client;
})(jQuery);
