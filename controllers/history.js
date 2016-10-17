((ng, App) => {
    'use strict';
    
    App.config(($stateProvider) => {
        $stateProvider.state('history', {
            url: '/history',
            reload: false,
            controller: 'HistoryController',
            templateUrl: 'templates/history.html'
        });
    });

    App.factory('HistoryStore', (Store, ActionModel) => new class HistoryStore {
        constructor() {
            this.store = new Store('History');
        }

        //noinspection JSAnnotator
        /**
         * @returns {Promise.<ActionModel[]>}
         */
        get actions() {
            return this.store.get('actions').then((actions) => {
                return actions.map((action) => new ActionModel(action));
            }, () => []);
        }

        //noinspection JSAnnotator
        /**
         * @param {ActionModel[]} actions
         */
        set actions(actions) {
            this.store.set('actions', actions.map((action) => {
                return action.toObject();
            }));
        }

        /**
         * @param {ActionModel} action
         */
        push(action) {
            return this.actions.then((actions) => {
                actions.unshift(action);
                actions.length = actions.length <= 100 ? actions.length : 100;
                this.actions = actions;
            });
        }
    });

    App.controller('HistoryController', class HistoryController {
        /**
         * @param $scope
         * @param {HistoryStore} HistoryStore
         */
        constructor($scope, HistoryStore) {
            $scope.actions = [];
            $scope.loading = false;
            $scope.voting = {};
            $scope.matched = false;

            $scope.like = (person) => {
                let action = 'like';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person).then(() => {
                        $scope.reload();
                    });
                });
            };

            $scope.pass = (person) => {
                let action = 'pass';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person).then(() => {
                        $scope.reload();
                    });
                });
            };

            $scope.react = (action, person) => {
                $scope.voting[person.id] = true;
                $scope.$apply();

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

            $scope.reload = () => {
                $scope.loading = true;

                return HistoryStore.actions.then((actions) => {
                    $scope.actions = actions;
                    $scope.loading = false;
                    $scope.$apply();
                });
            };

            $scope.ageText = (birth) => {
                return (new Date()).getYear() - birth.getYear();
            };

            $scope.reload();
        }
    });
})(angular, App);
