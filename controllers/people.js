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

    App.controller('PeopleController', class PeopleController {
        /**
         * @param $scope
         * @param $timeout
         * @param $rootScope
         * @param $window
         */
        constructor($scope, $timeout, $rootScope, $window) {
            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.refresh();
                }
            });

            // Listen for key events until state leaving.
            $window.onkeydown = (event) => {
                let handlerName = 'onKeyDown' + event.keyCode;
                $scope[handlerName] && $scope[handlerName](event);
            };
            let listenOff = $rootScope.$on('$stateChangeSuccess', () => {
                $window.onkeydown = null;
                listenOff();
            });

            // Main section.
            $scope.people = [];
            $scope.voting = {};
            $scope.loading = false;
            $scope.matched = false;

            $scope.like = (person) => {
                $scope.client.like(person.id).then((result) => {
                    if (result.match) {
                        $scope.matched = true;
                        $timeout(() => {
                            $scope.matched = false;
                        }, 1000);
                    }

                    let index = $scope.people.indexOf(person);
                    if (index > -1) {
                        $scope.people.splice(index, 1);
                        if (!$scope.people.length) {
                            $scope.refresh();
                        }
                    }
                    delete $scope.voting[person.id];
                    $scope.$apply();
                }, () => {
                    delete $scope.voting[person.id];
                    $scope.$apply();
                });

                $scope.voting[person.id] = true;
                $scope.$apply();
            };

            $scope.pass = (person) => {
                $scope.client.pass(person.id).then(() => {
                    let index = $scope.people.indexOf(person);
                    if (index > -1) {
                        $scope.people.splice(index, 1);
                        if (!$scope.people.length) {
                            $scope.refresh();
                        }
                    }
                    delete $scope.voting[person.id];
                    $scope.$apply();
                }, () => {
                    delete $scope.voting[person.id];
                    $scope.$apply();
                });

                $scope.voting[person.id] = true;
                $scope.$apply();
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

            $scope.ageText = (birth) => {
                let age = (new Date()).getYear() - birth.getYear();
                return age + ' years';
            };

            $scope.onKeyDown37 = (event) => {
                if ($scope.people.length && !$scope.voting[$scope.people[0].id]) {
                    $scope.pass($scope.people[0]);
                }
            };

            $scope.onKeyDown39 = (event) => {
                if ($scope.people.length && !$scope.voting[$scope.people[0].id]) {
                    $scope.like($scope.people[0]);
                }
            };
        }
    });
})(App);
