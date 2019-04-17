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
         * @param $timeout
         * @param $window
         * @param {HistoryStore} HistoryStore
         * @param {ActionModel} ActionModel
         */
        constructor($scope, $rootScope, $timeout, $window, HistoryStore, ActionModel) {
            $scope.$watch('loaded', (value) => {
                if (value) {
                    $scope.refresh();
                }
            });

            // Listen for key events until state leaving.
            $window.onkeydown = (event) => {
                let handlerName = 'onKeyDown' + event.keyCode;
                let galleryOpen = $rootScope.gallery.shown;
                $scope[handlerName] && !galleryOpen && $scope[handlerName](event);
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

            // Notifications.
            $scope.notification = '';

            $scope.pass = (person) => {
                let action = 'pass';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person);
                });
            };

            $scope.like = (person) => {
                let action = 'like';
                $scope.react(action, person).then((matched) => {
                    if (matched) {
                        $scope.notify('Got new match!');
                        $scope.$apply();
                    }
                    $scope.history(action, person);
                });
            };

            $scope.superlike = (person) => {
                let action = 'superlike';
                $scope.react(action, person).then((result) => {
                    if (result) {
                        $scope.notify('Got new match!');
                        $scope.$apply();
                    }
                    $scope.history(action, person);
                });
            };

            $scope.react = (action, person) => {
                $scope.voting[person.id] = true;

                let reactor = {
                    'like': $scope.client.like,
                    'pass': $scope.client.pass,
                    'superlike': $scope.client.superlike,
                }[action].bind($scope.client);

                // Strange bug with cancelled requests.
                // When this code called via button click, request sent will be cancelled.
                // But if we delay the request for >= 37msec it will be successfully sent.
                // I think, that problem is in engular $eval + strange bug in Chrome.
                return $timeout(() => reactor(person.id), 100).then((result) => {
                    let index = $scope.people.indexOf(person);
                    if (index > -1) {
                        $scope.people.splice(index, 1);
                        if (!$scope.people.length) {
                            $scope.refresh();
                        }
                    }
                    delete $scope.voting[person.id];
                    return result;
                }, (result) => {
                    delete $scope.voting[person.id];
                    $scope.notify(result.message);
                    throw result;
                });
            };

            $scope.notify = (message) => {
                $scope.notification = message;
                $timeout(() => {
                    if ($scope.notification == message) {
                        $scope.notification = '';
                    }
                }, 3000);
            };

            $scope.history = (action, person) => {
                let model = new ActionModel({});
                model.created = new Date();
                model.action = action;
                model.person = person;
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
                if (!birth) return null;
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
