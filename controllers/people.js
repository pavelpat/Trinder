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
         * @param $rootScope
         * @param $window
         * @param {HistoryStore} HistoryStore
         * @param {ActionModel} ActionModel
         */
        constructor($scope, $rootScope, $window, HistoryStore, ActionModel) {
            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.refresh();
                }
            });

            // Listen for key events until state leaving.
            $window.onkeydown = (event) => {
                let handlerName = 'onKeyDown' + event.keyCode;
                let galleryOpen = $rootScope.gallery.shown;
                $scope[handlerName] && !galleryOpen &&  $scope[handlerName](event);
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
                let action = 'like';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person);
                });
            };

            $scope.pass = (person) => {
                let action = 'pass';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person);
                });
            };

            $scope.react = (action, person) => {
                $scope.voting[person.id] = true;

                let reactor = {
                    'like': $scope.client.like,
                    'pass': $scope.client.pass
                }[action].bind($scope.client);

                return reactor(person.id).then(() => {
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
            };

            $scope.history = (action, person) => {
                let model = new ActionModel({
                    action: action,
                    created: new Date(),
                    person: person
                });
                HistoryStore.push(model);
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
                    $scope.$apply();
                }
            };

            $scope.onKeyDown39 = (event) => {
                if ($scope.people.length && !$scope.voting[$scope.people[0].id]) {
                    $scope.like($scope.people[0]);
                    $scope.$apply();
                }
            };
        }
    });
})(App);
