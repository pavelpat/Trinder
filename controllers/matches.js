((ng, App) => {
    'use strict';
    
    App.config(($stateProvider) => {
        $stateProvider.state('matches', {
            url: '/matches',
            reload: false,
            controller: 'MatchesController',
            templateUrl: 'templates/matches.html'
        });
    });

    App.factory('MatchesStore', (Store, MatchModel) => new class MatchesStore {
        constructor() {
            this.store = new Store('Cache');
        }

        /**
         * @returns {Promise.<Date>}
         */
        get activity() {
            return this.store.get('activity').then(
                (activity) => new Date(activity),
                () => {
                    let activity = new Date(),
                        interval = 1000 * 60 * 60 * 24 * 31 * 12 * 10;
                    activity.setTime(activity.getTime() - interval);
                    return activity;
                });
        }

        //noinspection JSAnnotator
        /**
         * @param {Date} value
         */
        set activity(value) {
            this.store.set('activity', value.toISOString());
        }

        /**
         * @returns {*|Promise.<Array<MatchModel>>}
         */
        get matches() {
            return this.store.get('matches').then(
                (matches) => matches.map((v) => new MatchModel(v)),
                () => []
            );
        }

        //noinspection JSAnnotator
        /**
         * @param {Array<MatchModel>} value
         */
        set matches(value) {
            this.store.set('matches', value.map((v) => v.toObject()));
        }
    });

    App.controller('MatchesController', class MatchesController {
        /**
         * @param $scope
         * @param $timeout
         * @param $anchorScroll
         * @param {MatchesStore} MatchesStore
         */
        constructor($scope, $timeout, $anchorScroll, MatchesStore) {
            /**
             * @type {Array<MatchModel>}
             */
            $scope.matches = [];

            /**
             * @type {MatchModel|null}
             */
            $scope.active = null;

            /**
             * @type {string}
             */
            $scope.message = '';

            $scope.refresh = () => {
                $scope.loading = true;
                Promise.all([
                    MatchesStore.activity,
                    MatchesStore.matches
                ]).then((args) => {
                    let activity = args[0],
                        matches = args[1];
                    return $scope.client.updates(activity).then((update) => {
                        merge(matches, update.matches);
                        MatchesStore.activity = update.activity;
                        MatchesStore.matches = matches;
                        return matches;
                    });
                }).then((matches) => {
                    $scope.loading = false;
                    $scope.matches = matches;
                    $scope.active = matches.length ? matches[0] : null;
                    $scope.$apply();
                    if (matches.length) {
                        $scope.scroll(matches[0]);
                    }
                });
            };

            $scope.send = (match, message) => {
                $scope.loading = true;
                $scope.client.send(match.id, message).then(() => {
                    $scope.message = '';
                    $scope.loading = false;
                    $scope.refresh();
                    $scope.$apply();
                }, () => {
                    $scope.matches = [];
                    $scope.loading = false;
                    $scope.refresh();
                    $scope.$apply();
                });
            };

            $scope.dialog = (match) => {
                $scope.active = match;
                $timeout(() => {
                    $scope.scroll(match);
                });
            };

            $scope.scroll = (match) => {
                if (match.messages.length) {
                    let message = match.messages[match.messages.length - 1],
                        hash = 'message-' + message.id;
                    $anchorScroll(hash);
                }
            };

            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.refresh();
                }
            });

            /**
             * @param {Array<MatchModel>} current
             * @param {Array<MatchModel>} fetched
             */
            function merge(current, fetched) {
                for (let cur of current) {
                    // Sort messages
                    cur.messages.sort((a, b) => a.sent - b.sent);
                }

                for (let fet of fetched) {
                    let merged = false;

                    // Merge match.
                    for (let cur of current) if (cur.id == fet.id) {
                        for (let attr of ['activity', 'person', 'messages']) if (fet[attr]) {
                            cur[attr] = fet[attr];
                        }
                        merged = true;
                        break;
                    }

                    // Insert new match.
                    if (!merged) {
                        current.push(fet);
                    }

                    // Sort messages
                    fet.messages.sort((a, b) => a.sent - b.sent);
                }

                // Sort matches.
                current.sort((a, b) => b.activity - a.activity);
            }

            $scope.ageText = (birth) => {
                return (new Date()).getYear() - birth.getYear();
            }
        }
    });
})(angular, App);
