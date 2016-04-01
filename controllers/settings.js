(function (App) {
    'use strict';

    App.controller('SettingsController', function ($scope, Auth) {
        // Auth section.
        $scope.client = null;
        $scope.person = null;

        Auth.singleAuth().then(function (cp) {
            $scope.client = cp.client;
            $scope.person = cp.person;
            $scope.$apply();
        });

        // Settings section.
        $scope.settings = [];

        // Leaflet settings.
        $scope.leaflet = {
            maxZoom: 14,
            minZoom: 1,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            attributionControl: true,
            tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            tileLayerOptions: {
                attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            icon: {
                url: 'bower_components/leaflet/dist/images/marker-icon.png',
                retinaUrl: 'bower_components/leaflet/dist/images/marker-icon-2x.png',
                size: [25, 41],
                anchor: [12, 40],
                popup: [0, -40],
                shadow: {
                    url: 'bower_components/leaflet/dist/images/marker-shadow.png',
                    retinaUrl: 'bower_components/leaflet/dist/images/marker-shadow.png',
                    size: [41, 41],
                    anchor: [12, 40]
                }
            },
            path: {
                weight: 10,
                opacity: 1,
                color: '#0000ff'
            },
            center: {
                lat: 0,
                lng: 0,
                zoom: 10
            }
        };
    });
})(App);
