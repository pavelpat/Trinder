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
         * @param $timeout
         * @param {HistoryStore} HistoryStore
         * @param {ActionModel} ActionModel
         */
        constructor($scope, $timeout, HistoryStore, ActionModel) {
            $scope.actions = [];
            $scope.loading = false;
            $scope.voting = {};
            $scope.matched = false;

            $scope.pass = (person) => {
                let action = 'pass';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person).then(() => {
                        $scope.refresh();
                    });
                });
            };

            $scope.like = (person) => {
                let action = 'like';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person).then(() => {
                        $scope.refresh();
                    });
                });
            };

            $scope.superlike = (person) => {
                let action = 'superlike';
                $scope.react(action, person).then(() => {
                    $scope.history(action, person).then(() => {
                        $scope.refresh();
                    });
                });
            };

            $scope.react = (action, person) => {
                $scope.voting[person.id] = true;

                let reactor = {
                    'pass': $scope.client.pass,
                    'like': $scope.client.like,
                    'superlike': $scope.client.superlike
                }[action].bind($scope.client);

                let endVoting = () => {
                    delete $scope.voting[person.id];
                };

                // Strange bug with cancelled requests.
                // When this code called via button click, request sent will be cancelled.
                // But if we delay the request for >= 37msec it will be successfully sent.
                // I think, that problem is in engular $eval + strange bug in Chrome.
                return $timeout(() => reactor(person.id), 100).then(endVoting, endVoting);
            };

            $scope.history = (action, person) => {
                let model = new ActionModel({});
                model.created = new Date();
                model.action = action;
                model.person = person;
                return HistoryStore.push(model);
            };

            $scope.refresh = () => {
                $scope.loading = true;

                return HistoryStore.actions.then((actions) => {
                    $scope.actions = actions;
                    $scope.loading = false;
                    $scope.$apply();
                });
            };

            $scope.ageText = (birth) => {
                if (!birth) return null;
                return (new Date()).getYear() - birth.getYear();
            };

            $scope.refresh();
        }
    });
})(angular, App);
