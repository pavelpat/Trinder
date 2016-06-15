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
                var client = $scope.client;

                $scope.location.paths = {};

                defaultPos().then((pos) => {
                    // Jump to default point.
                    return client.ping(pos[0], pos[1]).then(() => {
                        return client.person(id).then((person) => {
                            $scope.location.paths.r1 = {
                                type: 'circle',
                                radius: person.distance * 1000,
                                latlngs: {lat: pos[0], lng: pos[1]}
                            };
                            $scope.$apply();
                            return [pos[0], pos[1] + (20) / 111.3];
                        });
                    });
                }).then((pos) => {
                    // Jump to second point.
                    return client.ping(pos[0], pos[1]).then(() => {
                        return client.person(id).then((person) => {
                            $scope.location.paths.r2 = {
                                type: 'circle',
                                radius: person.distance * 1000,
                                latlngs: {lat: pos[0], lng: pos[1]}
                            };
                            $scope.$apply();

                            return [pos[0] - (10) / 111, pos[1]];
                        });
                    });
                }).then((pos) => {
                    // Jump to third point.
                    return client.ping(pos[0], pos[1]).then(() => {
                        return client.person(id).then((person) => {
                            $scope.location.paths.r3 = {
                                type: 'circle',
                                radius: person.distance * 1000,
                                latlngs: {lat: pos[0], lng: pos[1]}
                            };
                            $scope.$apply();
                            return [pos[0], pos[1] - (20) / 111.3];
                        });
                    });
                }).then((pos) => {
                    // Jump to forth point.
                    return client.ping(pos[0], pos[1]).then(() => {
                        return client.person(id).then((person) => {
                            $scope.location.paths.r4 = {
                                type: 'circle',
                                radius: person.distance * 1000,
                                latlngs: {lat: pos[0], lng: pos[1]}
                            };
                            $scope.$apply();
                        });
                    });
                }).then(() => {
                    // Restore default point.
                    defaultPos().then((pos) => client.ping(pos[0], pos[1]));
                })
            };

            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.detect($stateParams.personId);
                }
            });

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