((ng, App) => {
    'use strict';

    App.config(($stateProvider) => {
        $stateProvider.state('locator', {
            url: '/locator/:personId',
            reload: false,
            controller: 'LocatorController',
            templateUrl: 'templates/locator.html'
        });
    });

    App.controller('LocatorController', class LocatorController {
        /**
         * @param $scope
         * @param $stateParams
         * @param SettingsStore
         * @param Geo
         */
        constructor($scope, $stateParams, SettingsStore, Geo) {
            $scope.location = {
                defaults: {
                    minZoom: 2,
                    maxZoom: 15,
                    doubleClickZoom: true,
                    scrollWheelZoom: true,
                    attributionControl: true,
                    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    center: {
                        lat: 0,
                        lng: 0,
                        zoom: 2
                    }
                },
                position: {},
                events: {},
                paths: {}
            };

            $scope.detect = (id) => {
                let client = $scope.client,
                    points = [
                        [0, 0],
                        [0, 60 / 111.3],
                        [-30 / 111, 30 / 111.3]
                    ],
                    precn = 100,
                    limit = 25;

                $scope.detected = false;
                $scope.location.paths = {};

                defaultPos().then((pos) => {
                    // Jump to all view points and measure distances;
                    let promise = new Promise((resolve) => resolve([]));
                    for (let i = 0; i < points.length; i++) {
                        promise = promise.then((results) => {
                            return predictDistance(
                                id, pos[0] + points[i][0], pos[1] + points[i][1], precn, limit
                            ).then((distance) => results.concat([distance]));
                        });
                    }
                    return promise;
                }).then((results) => {
                    // Show results.
                    for (let i = 0; i < results.length; i++) {
                        $scope.detected = true;
                        $scope.location.paths['r' + i] = {
                            type: 'circle',
                            radius: results[i].distance,
                            latlngs: {
                                lat: results[i].lat,
                                lng: results[i].lng
                            }
                        };
                        $scope.$apply();
                    }
                }).then(() => {
                    // Restore default point.
                    defaultPos().then((pos) => client.ping(pos[0], pos[1]));
                });
            };

            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.detect($stateParams.personId);
                }
            });

            function predictDistance(id, lat, lng, precn, limit) {
                // Start jumping down.
                return (new Promise((resolve) => {
                    (function recurse(distance) {
                        if (distance.distance && !distance.rivals.length) {
                            distance.rivals = [distance.distance, distance.distance];
                        }

                        // When distance changes change direction and width of rectification.
                        if (distance.distance != distance.previous && distance.previous != 0) {
                            distance.rivals = [distance.distance, distance.previous];
                            distance.forward = !distance.forward;
                            distance.rectifn *= 0.5;
                        }

                        // Change lat with known width of clarification into known direction.
                        distance.lat += (distance.forward ? 1 :-1) * distance.rectifn * (1 / (40000000 / 360));
                        distance.limit -= 1;

                        // Measure distance to target from new point.
                        return measureFrom(id, distance.lat, distance.lng).then((measured) => {
                            // Jump and measure again if precision is not satisfied.
                            ((distance.rectifn > precn && distance.limit) ? recurse : resolve)({
                                lat: distance.lat,
                                lng: distance.lng,
                                rectifn: distance.rectifn,
                                forward: distance.forward,
                                rivals: distance.rivals,
                                previous: distance.distance,
                                distance: measured,
                                limit: distance.limit
                            });
                        });
                    })({
                        lat: lat,
                        lng: lng,
                        rectifn: 5000,
                        forward: true,
                        rivals: [],
                        previous: 0,
                        distance: 0,
                        limit: limit
                    });
                })).then((distance) => {
                    lat: distance.lat,
                    lng: distance.lng,
                    distance: Math.min(distance.rivals[0], distance.rivals[1])
                });
            }

            function measureFrom(id, lat, lng) {
                let client = $scope.client;

                return client.ping(lat - 0.05, lng - 0.05).then(() => {
                    return client.ping(lat, lng);
                }).then(() => {
                    return client.person(id);
                }).then((person) => {
                    return person.distance;
                });
            }

            function defaultPos() {
                return SettingsStore.settings.then((settings) => {
                    if (settings.geolocation) {
                        // Browser selected location.
                        return Geo.position();
                    } else if (settings.geolat && settings.geolon) {
                        // User selected location.
                        return [settings.geolat, settings.geolon];
                    } else {
                        // Unknown location.
                        return [0, 0];
                    }
                });
            }
        }
    });
})(angular, App);
