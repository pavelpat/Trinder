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
         */
        constructor($scope, $stateParams) {
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
                // debugger;
            };

            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.detect($stateParams.personId);
                }
            });
        }
    });
})(angular, App);