((ng, App) => {
    'use strict';

    App.config(($stateProvider) => {
        $stateProvider.state('person', {
            url: '/person/:personId',
            reload: false,
            controller: 'PersonController',
            templateUrl: 'templates/person.html'
        });
    });

    App.controller('PersonController', class PersonController {
        /**
         * @param $scope
         * @param $stateParams
         */
        constructor($scope, $stateParams) {
            $scope.loading = true;
            $scope.person = null;

            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.load($stateParams.personId);
                }
            });

            $scope.load = (personId) => {
                $scope.client.person(personId).then((person) => {
                    $scope.loading = false;
                    $scope.person = person;
                    $scope.$apply();
                });
            };

            $scope.ageText = (birth) => {
                if (!birth) return null;
                let age = (new Date()).getYear() - birth.getYear();
                return age + ' years';
            };

            $scope.distanceText = (distance) => {
                if (!distance) return null;
                distance = Math.round(distance / 1000);
                return distance + ' km';
            };
        }
    });
})(angular, App);