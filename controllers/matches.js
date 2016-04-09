((App) => {
    'use strict';

    App.factory('MatchesCache', (Store) => new class MatchesCache {
        constructor() {
            this.store = new Store('Cache');
        }

        get profile() {
            return this.store.get('profile').catch(() => ({}));
        }

        set profile(value) {
            this.store.set('profile', value);
        }

        /**
         * @returns {Promise.<Date>}
         */
        get activity() {
            return this.store.get('activity').then((activity) => {
                return new Date(activity);
            }, () => {
                var activity = new Date(),
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

        get matches() {
            return this.store.get('matches').catch(() => []);
        }

        set matches(value) {
            this.store.set('matches', value);
        }

        reset() {
            return Promise.all([
                this.store.remove('profile'),
                this.store.remove('activity'),
                this.store.remove('matches')
            ]);
        }
    });

    App.controller('MatchesController', class MatchesController {
        /**
         * @param $scope
         * @param {MatchesCache} MatchesCache
         */
        constructor($scope, MatchesCache) {
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

            $scope.$watch('client', (value) => {
                if (value !== null) {
                    $scope.refresh();
                }
            });

            $scope.refresh = () => {
                $scope.loading = true;
                Promise.all([
                    MatchesCache.activity,
                    MatchesCache.matches
                ]).then((ready) => $scope.client.updates(ready[0]).then((update) => {
                    let merged = merge(ready[1], update.matches);
                    MatchesCache.activity = update.activity;
                    MatchesCache.matches = merged;
                    return merged;
                })).then((matches) => {
                    $scope.loading = false;
                    $scope.matches = matches;
                    $scope.$apply();
                });
            };

            $scope.dialog = (match) => {
                $scope.active = match;
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

            /**
             * @param {Array<MatchModel>} cached
             * @param {Array<MatchModel>} fetched
             */
            function merge(cached, fetched) {
                // There is already ordered data in cache.
                if (!fetched.length) {
                    return cached;
                }

                // Merge matches items with order.
                for (let match of fetched) {
                    // Sort messages by date.
                    match.messages.sort((a, b) => b.sent - a.sent);

                    // Insert match to correct place.
                    if (cached.length) {
                        var replaced = false;

                        // Replace existent match.
                        for (var i = 0; i < cached.length; i++) {
                            if (match.id == cached[i].id) {
                                cached[i] = match;
                                replaced = true;
                                break;
                            }
                        }

                        // Insert new match.
                        if (!replaced) for (var j = 0; j < cached.length; j++) {
                            var currCachedActivity = cached[j].activity,
                                prevCachedActivity = (j != 0) ? cached[j - 1].activity : null;

                            if (
                                // Merge first element.
                                (match.activity > currCachedActivity && prevCachedActivity === null) ||

                                // Merge middle element.
                                (match.activity > currCachedActivity && match.activity <= prevCachedActivity)
                            ) {
                                cached.splice(j, 0, match);
                                break;
                            } else if (
                                // Merge last element.
                                match.activity < currCachedActivity && j == cached.length - 1
                            ) {
                                cached.splice(j + 1, 0, match);
                                break;
                            }
                        }
                    } else {
                        cached.push(match);
                    }
                }

                return cached;
            }
        }
    });
})(App);