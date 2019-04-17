(($, App) => {
    'use strict';

    App.factory('Client', function(UserModel, PersonModel, UpdateModel) {
        return class Client {
            constructor(fbId, fbToken) {
                this.fbId = fbId;
                this.fbToken = fbToken;
                this.apiUrl = 'https://api.gotinder.com/';
                this.accessToken = null;
                this.refreshToken = null;
            }

            setauth(auth) {
                this.accessToken = auth.accessToken;
                this.refreshToken = auth.refreshToken;
            }

            async auth() {
                let result = await this._post_v2('auth/login/facebook', {
                    'token': this.fbToken
                }, null, 200);

                return {
                    'accessToken': result.api_token,
                    'refreshToken': result.refresh_token,
                    'phoneValidated': !result.sms_validation,
                };
            }

            async smsSend(phone) {
                return await this._post_v2('auth/sms/send?auth_type=sms', {
                    'phone_number': phone
                }, null, 200);
            }

            async smsValidate(phone, code) {
                return await this._post_v2('auth/sms/validate?auth_type=sms', {
                    'phone_number': phone,
                    'otp_code': code,
                    'is_update': false
                }, null, 200);
            }

            async profile(user=null) {
                if (user === null) {
                    // Request like official web version of Tinder client.
                    let response = await this._get_v2('profile', null, null, [
                        'account', 'user' 
                    ]);
    
                    return new UserModel(response.user);
                } else {
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
    
                    return await this._post('profile', data);
                }
            }

            async ping(lat, lon) {
                try {
                    await this._post('user/ping', {
                        'lat': lat,
                        'lon': lon
                    });    
                } catch (e) {
                    // Location change is not significant.
                    // Major posigion change is not significant.
                }
            } 

            async person(id) {
                let response = await this._get('user/' + id);
                return new PersonModel(response.results);
            }

            async pass(id) {
                await this._get('pass/' + id);
            }

            async like(id) {
                let response = await this._get('like/' + id);
                if (response['rate_limited_until']) {
                    let date = new Date(response['rate_limited_until']);
                    throw Error('No more likes until ' + date.toLocaleString());
                }
                return response['match'] === true;
            }

            async superlike(id) {
                let response = await this._post('like/' + id + '/super');
                if (response['limit_exceeded']){
                    throw Error('Superlikes limit exceeded');
                }
                return response['match'] === true;
            }

            async recs() {
                let response = await this._get('user/recs');
                return response.results.map((person) => new PersonModel(person));
            }

            async send(id, message) {
                await this._post('user/matches/' + id, {
                    'message': message
                });
            }

            async updates(since) {
                let response = await this._post('updates', {
                    'last_activity_date': since.toISOString()
                }, {
                    'Platform': 'web'
                });
                
                if (response.matches) {
                    var present = (item) => !!item.person;
                    response.matches = response.matches.filter(present);
                }

                return new UpdateModel(response);
            }

            async _get(path, extra_headers=null) {
                let headers = new Headers({
                    'Content-Type': 'application/json'
                });
                
                if (this.accessToken) {
                    headers.append('X-Auth-Token', this.accessToken);
                }

                if (extra_headers) for (let pair of Object.entries(extra_headers)) {
                    headers.append(pair[0], pair[1]);
                }

                let response = null;
                try {
                    response = await fetch(this.apiUrl + path, {
                        method: 'GET',
                        headers: headers
                    });
                } catch (error) {
                    throw this._error('Client fetch error', [
                        ['method', 'GET'],
                        ['path', path],
                        ['error', error]
                    ]);
                }

                let respjson = await response.json();
                if (respjson.error) {
                    throw this._error('Client json error', [
                        ['method', 'GET'],
                        ['path', path],
                        ['response', JSON.stringify(respjson.error)]
                    ]);
                }

                return respjson;
            }

            async _post(path, data, extra_headers=null) {
                let headers = new Headers({
                    'Content-Type': 'application/json'
                });
                
                if (this.accessToken) {
                    headers.append('X-Auth-Token', this.accessToken);
                }

                if (extra_headers) for (let pair of Object.entries(extra_headers)) {
                    headers.append(pair[0], pair[1]);
                }
                
                let response = null;
                try {
                    response = await fetch(this.apiUrl + path, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    });
                } catch (error) {
                    throw this._error('Client status error', [
                        ['method', 'POST'],
                        ['path', path],
                        ['body', JSON.stringify(data)],
                        ['error', error],
                    ]);
                }

                let respjson = await response.json();
                if (respjson.error) {
                    throw this._error('Client json error', [
                        ['method', 'POST'],
                        ['path', path],
                        ['body', JSON.stringify(data)],
                        ['response', JSON.stringify(respjson)]
                    ]);
                }

                return respjson;
            }

            _error(message, details) {
                let detail = (d) => d[0] + '=' + d[1];
                return message + ': ' + details.map(detail).join(', ');
            }

            async _get_v2(path, extra_headers=null, assert_status=null, include_fields=null) {
                if (include_fields) {
                    path = path + '?include=' + include_fields.join(',');
                }

                let respjson = await this._get('v2/' + path, extra_headers);
    
                if (assert_status && assert_status !== respjson.meta.status) {
                    throw this._error('Client meta error', [
                        ['method', 'GET'],
                        ['path', path],
                        ['error', respjson.meta],
                        ['response', JSON.stringify(respjson)]
                    ]);
                }

                return respjson.data;
            }

            async _post_v2(path, data, extra_headers=null, assert_status=null) {
                let respjson = await this._post('v2/' + path, data, extra_headers);
                
                if (assert_status && assert_status !== respjson.meta.status) {
                    throw this._error('Client meta error', [
                        ['method', 'POST'],
                        ['path', path],
                        ['body', JSON.stringify(data)],
                        ['status', respjson.meta.status],
                        ['response', JSON.stringify(respjson)]
                    ]);
                }

                return respjson.data;
            }
        }
    });
})(jQuery, App);
