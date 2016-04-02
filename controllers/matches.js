(function (App) {
    'use strict';

    App.controller('MatchesController', function ($scope, Auth, Store) {
        // Store section.
        var store = new Store('Matches');

        // Auth section.
        $scope.client = null;
        $scope.person = null;

        Auth.singleAuth().then(function (cp) {
            $scope.client = cp.client;
            $scope.person = cp.person;
            $scope.refresh();
            $scope.$apply();
        });

        // Gallery section.
        $scope.gallery = {
            shown: false,
            slides: [],
            options: {
                history: false,
                shareEl: false
            }
        };

        $scope.gallery.open = function (photos, index) {
            $scope.gallery.shown = true;
            $scope.gallery.options.index = index;
            $scope.gallery.slides = photos.map(function(photo) {
                return {
                    src: photo.url,
                    w: 2048,
                    h: 2048
                }
            });
        };

        $scope.gallery.close = function () {
            $scope.gallery.shown = false;
        };

        // Main section.
        $scope.matches = [];
        $scope.loading = false;
        $scope.active = null;
        $scope.message = '';

        $scope.dialog = function (match) {
            $scope.active = match;
        };

        $scope.send = function (match, message) {
            $scope.loading = true;
            $scope.client.send(match.id, message).then(function () {
                $scope.message = '';
                $scope.loading = false;
                $scope.$apply();
                $scope.refresh();
            }, function () {
                $scope.matches = [];
                $scope.loading = false;
                $scope.$apply();
            });
        };

        $scope.refresh = function () {
            $scope.loading = true;
            cached().then(fetch).then(merge).then(cache).then(function (updates) {
                $scope.matches = updates.matches;
                $scope.active = updates.matches[0] || null;
                $scope.loading = false;
                $scope.$apply();
            }, function () {
                $scope.matches = [];
                $scope.loading = false;
                $scope.$apply();
            });
        };

        function cached() {
            return store.get('updates').then((updates) => {
                return updates ? updates : {
                    lastActivity: null,
                    matches: []
                };
            });
        }

        function fetch(cachedUpdates){
            var lastActivity;
            if (cachedUpdates.lastActivity) {
                lastActivity = new Date(cachedUpdates.lastActivity);
            } else {
                lastActivity = new Date();
                lastActivity.setTime(lastActivity.getTime() - 1000 * 60 * 60 * 24 * 31);
            }

            return $scope.client.updates(lastActivity).then(function(updates){
                return [cachedUpdates, updates || {}];
            });
        }

        function merge(updates) {
            var cached = updates[0],
                fetched = updates[1];

            // Take last activity date.
            cached.lastActivity = fetched.lastActivity;

            // There is already ordered data in cache.
            if (!fetched.matches.length) {
                return cached;
            }

            // Merge matches items with order.
            for (var i = 0; i < fetched.matches.length; i++) {
                var match = fetched.matches[i],
                    lastActivity = new Date(match.lastActivity);

                // Sort messages by date.
                match.messages.sort(function (a, b) {
                    return new Date(b.sent) - new Date(a.sent);
                });

                // Insert match to correct place.
                if (cached.matches.length) {
                    var replaced = false;

                    // Replace existent match.
                    for (var j = 0; j < cached.matches.length; j++) {
                        if (match.id == cached.matches[j].id) {
                            cached.matches[j] = match;
                            replaced = true;
                            break;
                        }
                    }

                    // Insert new match.
                    if (!replaced) for (var j = 0; j < cached.matches.length; j++) {
                        var currCachedActivity = new Date(cached.matches[j].lastActivity),
                            prevCachedActivity = (j != 0) ? new Date(cached.matches[j - 1].lastActivity) : null;

                        if (
                            // Merge first element.
                            (lastActivity > currCachedActivity && prevCachedActivity === null) ||

                            // Merge middle element.
                            (lastActivity > currCachedActivity && lastActivity <= prevCachedActivity)
                        ) {
                            cached.matches.splice(j, 0, match);
                            break;
                        } else if (
                            // Merge last element.
                            lastActivity < currCachedActivity && j == cached.matches.length - 1
                        ) {
                            cached.matches.splice(j + 1, 0, match);
                            break;
                        }
                    }
                } else {
                    cached.matches.push(match);
                }
            }

            return cached;
        }

        function cache(updates) {
            store.set('updates', updates);
            return updates;
        }
    })
})(App);