((App) => {
    'use strict';

    App.controller('SettingsController', function ($scope, ReadyClient) {
        // Auth section.
        $scope.client = null;
        $scope.person = null;

        ReadyClient.then((cp) => {
            $scope.client = cp.client;
            $scope.person = cp.person;
            $scope.$apply();
        });

        // Settings section.
        $scope.settings = [];

        // Locations section.
        $scope.location = {
            defaults: {
                minZoom: 2,
                maxZoom: 12,
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
                    radius: 1000,
                    latlngs: {
                        lat: 50.8333,
                        lng: 4
                    }
                }
            },
            slider: {
                floor: 3,
                ceil: 100,
                value: 50,
                translate: (value) => {
                    value = translateTo(value);
                    return (value >= 1000) ?
                        Math.floor(value / 1000) + ',' + Math.floor(value / 100) % 10 + ' km' :
                        value + ' m';
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
            return Math.round(Math.sqrt(value) / 15);
        }

        // Drag circle to marker.
        $scope.$on('leafletDirectiveMarker.move', (event, args) => {
            var latlng = args.leafletEvent.latlng;
            $scope.location.paths.radius.latlngs = {
                lat: latlng.lat,
                lng: latlng.lng
            };
        });
    });
})(App);
