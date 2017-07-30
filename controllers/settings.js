((App) => {
    'use strict';

    App.config(($stateProvider) => {
        $stateProvider.state('settings', {
            url: '/settings',
            reload: false,
            controller: 'SettingsController',
            templateUrl: 'templates/settings.html'
        });
    });

    App.value('DefaultSettings', {
        'geolocation': true,
        'geolat': 51.5,
        'geolon': -0.125
    });

    App.factory('SettingsStore', (Store, SettingsModel, DefaultSettings) => new class SettingsStore {
        constructor() {
            this.store = new Store('Settings');
        }

        /**
         * @returns {Promise.<SettingsModel>}
         */
        get settings() {
            return this.store.get('settings').then(
                (settings) => new SettingsModel(settings),
                () => new SettingsModel(DefaultSettings)
            );
        }

        //noinspection JSAnnotator
        /**
         * @param {SettingsModel} value
         */
        set settings(value) {
            this.store.set('settings', value.toObject());
        }
    });

    App.controller('SettingsController', class SettingsController {
        /**
         * @param $scope
         * @param $window
         * @param $timeout
         * @param Geo
         * @param SettingsStore
         * @param Store
         */
        constructor($scope, $window, $timeout, Geo, SettingsStore, Store) {
            $scope.settings = null;
            SettingsStore.settings.then((settings) => {
                $scope.settings = settings;
                $scope.$apply();
            });

            $scope.$watch('user', (user) => {
                if (user !== null) {
                    let distance = user.distance * 1000 * 1.60934;
                    $scope.location.paths.radius.radius = distance;

                    // Fixes bug with incorrect position of slider on page load.
                    // When page loads first time slider stay in incorrect position
                    // while model value is set properly. Set new (different) value
                    // in current session and set correct value in timeout session.
                    let translated = translateFrom(distance);
                    $scope.location.slider.value = translated - 1;
                    $timeout(() => {$scope.location.slider.value = translated;}, 0);
                }
            });

            // Locations section.
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
                markers: {
                    location: {
                        lat: 50.8333,
                        lng: 4,
                        focus: false,
                        message: 'I am here',
                        draggable: true
                    }
                },
                paths: {
                    radius: {
                        type: 'circle',
                        radius: 0,
                        latlngs: {
                            lat: 50.8333,
                            lng: 4
                        }
                    }
                },
                slider: {
                    floor: 10,
                    ceil: 100,
                    value: 45,
                    translate: (value) => {
                        value = translateTo(value);
                        return Math.floor(value / 1000) + ',' +
                            Math.floor(value / 100) % 10 + ' km';
                    }
                }
            };

            $scope.$watch('location.slider.value', (value) => {
                $scope.location.paths.radius.radius = translateTo(value);
            });

            function translateTo(value) {
                return Math.round(15 * value * value / 50) * 50;
            }

            function translateFrom(value) {
                return Math.round(Math.sqrt(value / 15));
            }

            // Drag circle to marker.
            $scope.$on('leafletDirectiveMarker.move', (event, args) => {
                let geo = args.leafletEvent.latlng;
                $scope.location.paths.radius.latlngs = {
                    lat: geo.lat,
                    lng: geo.lng
                };
                if ($scope.settings) {
                    $scope.settings.geolat = geo.lat;
                    $scope.settings.geolon = geo.lng;
                }
            });

            // Bind checkbox and marker.
            $scope.$watch('settings.geolocation', (value) => {
                if (value !== undefined) {
                    let marker = $scope.location.markers.location;
                    if (value) {
                        Geo.position().then((args) => {
                            let geolat = args[0],
                                geolon = args[1];
                            if (value) {
                                marker.draggable = false;
                                marker.lat = geolat;
                                marker.lng = geolon;
                                $scope.$apply();
                            }
                        });
                    } else {
                        marker.draggable = true;
                        marker.lat = $scope.settings.geolat;
                        marker.lng = $scope.settings.geolon;
                    }
                }
            });

            // Save settings.
            $scope.save = () => {
                $scope.loading = true;
                SettingsStore.settings = $scope.settings;
                Promise.all([
                    $scope.client.ping($scope.settings.geolat, $scope.settings.geolon),
                    $scope.client.profile(translateTo($scope.location.slider.value))
                ]).then(() => {
                    $scope.loading = false;
                    $scope.saved = true;
                    $scope.$apply();
                });
            };

            // Clear storage.
            $scope.clear = () => {
                Store.clear().then(() => {
                    $window.location.reload();
                });
            };
        }
    });
})(App);
