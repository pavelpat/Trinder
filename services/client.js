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

            profile(user) {
                let data = user.toObject();

                let distanceMi = data['distance_filter'];
                distanceMi = distanceMi < 1 ? 1 : distanceMi;
                distanceMi = distanceMi > 150 ? 150 : distanceMi;
                data['distance_filter'] = distanceMi;

                let updateFields = [
                    'age_filter_min',
                    'age_filter_max',
                    'bio',
                    'gender',
                    'gender_filter',
                    'discoverable',
                    'distance_filter'
                ];
                for (let field in data){
                    if (data.hasOwnProperty(field)) {
                        if (updateFields.indexOf(field) == -1) {
                            delete data[field];
                        }
                    }
                }

                return this._post('profile', data);
            }

            ping(lat, lon) {
                return this._post('user/ping', {
                    'lat': lat,
                    'lon': lon
                }).then((result) => !result['error']);
            }

            person(id) {
                return this._get('user/' + id).then((response) => {
                    return new PersonModel(response.results);
                });
            }

            pass(id) {
                return this._get('pass/' + id);
            }

            like(id) {
                return this._get('like/' + id).then((response) => {
                    if (response['rate_limited_until']) {
                        let date = new Date(response['rate_limited_until']);
                        throw Error('No more likes until ' + date.toLocaleString());
                    }
                    return response['match'] === true;
                });
            }

            superlike(id) {
                return this._post('like/' + id + '/super').then((response) => {
                    if (response['limit_exceeded']){
                        throw Error('Superlikes limit exceeded');
                    }
                    return response['match'] === true;
                });
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
                }).then((result) => {
                    if (result.matches) {
                        var present = (item) => !!item.person;
                        result.matches = result.matches.filter(present);
                    }

                    return new UpdateModel(result);
                });
            }

            _get(path) {
                let headers = {
                    'Content-Type': 'application/json'
                };
                if (this.authToken) {
                    headers['X-Auth-Token'] = this.authToken;
                }

                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.apiUrl + path,
                        type: 'get',
                        headers: headers
                    }).success((r) => {
                        resolve(r);
                    }).error((e) => {
                        reject(this._error('Client error', [
                            ['method', 'GET'],
                            ['path', path],
                            ['status', e.status],
                            ['response', e.responseText]
                        ]));
                    });
                });
            }

            _post(path, data) {
                let headers = {
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
                        reject(this._error('Client error', [
                            ['method', 'POST'],
                            ['path', path],
                            ['status', e.status],
                            ['reqbody', data],
                            ['response', e.responseText]
                        ]));
                    });
                });
            }

            _error(message, details) {
                let detail = (d) => d[0] + '=' + d[1];
                return message + ': ' + details.map(detail).join(', ');
            }
        }
    });
})(jQuery, App);
