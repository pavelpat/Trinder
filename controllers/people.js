((App) => {
    'use strict';

    App.config(($stateProvider) => {
        $stateProvider.state('people', {
            url: '/people',
            reload: false,
            controller: 'PeopleController',
            templateUrl: 'templates/people.html'
        });
    });

    App.controller('PeopleController', function ($scope) {
        $scope.$watch('client', (value) => {
            if (value !== null) {
                $scope.refresh();
            }
        });

        // Main section.
        $scope.people = [];
        $scope.loading = false;
        $scope.voting = false;

        $scope.like = (person) => {
            $scope.voting = true;
            $scope.client.like(person.id).then(() => {
                var index = $scope.people.indexOf(person);
                if (index > -1) {
                    $scope.people.splice(index, 1);
                    if (!$scope.people.length) {
                        $scope.refresh();
                    }
                }
                $scope.voting = false;
                $scope.$apply();
            }, () => {
                $scope.voting = false;
                $scope.$apply();reload
            })
        };

        $scope.pass = (person) => {
            $scope.voting = true;
            $scope.client.pass(person.id).then(() => {
                var index = $scope.people.indexOf(person);
                if (index > -1) {
                    $scope.people.splice(index, 1);
                    if (!$scope.people.length) {
                        $scope.refresh();
                    }
                }
                $scope.voting = false;
                $scope.$apply();
            }, () => {
                $scope.voting = false;
                $scope.$apply();
            })
        };

        $scope.refresh = () => {
            $scope.loading = true;
            $scope.client.recs().then((recs) => {
                $scope.people = recs;
                $scope.loading = false;
                $scope.$apply();
            }, () => {
                $scope.people = [];
                $scope.loading = false;
                $scope.$apply();
            });
        };
    });
})(App);
