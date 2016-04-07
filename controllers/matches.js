((App) => {
    'use strict';

    App.controller('MatchesController', class MatchesController {
        /**
         * @param $scope
         * @param {Cache} Cache
         * @param {Promise} ReadyClient
         */
        constructor($scope, Cache, ReadyClient) {
            this.scope = $scope;
            this.cache = new Cache();
            this.client = null;

            ReadyClient.then((client, profile) => {
                this.initClient(client, profile);
                this.initGallery();
                this.initDialog();
            });
        }

        initClient(client, profile) {
            let $s = this.scope;

            this.cache.profile = profile;
            this.scope.ready = client;
            this.scope.person = profile;

            // this.scope.refresh();

            this.scope.$apply();
        }

        initDialog() {
            let $s = this.scope;

            $s.matches = [];
            $s.loading = false;
            $s.active = null;
            $s.message = '';

            $s.dialog = (match) => {
                $s.active = match;
            };

            $s.send = (match, message) => {
                $s.loading = true;
                $s.client.send(match.id, message).then(() => {
                    $s.message = '';
                    $s.loading = false;
                    $s.$apply();
                    $s.refresh();
                }, () => {
                    $s.matches = [];
                    $s.loading = false;
                    $s.$apply();
                });
            };

            $s.refresh = () => {
                $s.loading = true;
                this.update().then((updates) => {
                    $s.matches = updates.matches;
                    $s.active = updates.matches[0] || null;
                    $s.loading = false;
                    $s.$apply();
                }, () => {
                    $s.matches = [];
                    $s.loading = false;
                    $s.$apply();
                });
            };
        }

        initGallery() {
            let $s = this.scope;

            $s.gallery = {
                shown: false,
                slides: [],
                options: {
                    history: false,
                    shareEl: false
                }
            };

            $s.gallery.open = (photos, index) => {
                $s.gallery.shown = true;
                $s.gallery.options.index = index;
                $s.gallery.slides = photos.map((photo) => ({
                    src: photo.url,
                    w: 2048,
                    h: 2048
                }));
            };

            $s.gallery.close = () => {
                $s.gallery.shown = false;
            };
        }

        update() {
            Promise.all([
                this.cache.activity,
                this.cache.matches
            ]).then((activity, matches) => {
                return this.client.updates(activity).then((updates) => {
                    this.cache.activity = updates.lastActivity;
                    this.cache.matches = this.merge(matches, updates.matches);
                });
            });
        }

        merge(cached, fetched) {
            // Take last activity date.
            cached.lastActivity = fetched.activity;

            // There is already ordered data in cache.
            if (!fetched.matches.length) {
                return cached;
            }

            // Merge matches items with order.
            for (let match of fetched.matches) {
                var lastActivity = new Date(match.activity);

                // Sort messages by date.
                match.messages.sort((a, b) => new Date(b.sent) - new Date(a.sent));

                // Insert match to correct place.
                if (cached.matches.length) {
                    var replaced = false;

                    // Replace existent match.
                    for (var i = 0; i < cached.matches.length; i++) {
                        if (match.id == cached.matches[i].id) {
                            cached.matches[i] = match;
                            replaced = true;
                            break;
                        }
                    }

                    // Insert new match.
                    if (!replaced) for (var j = 0; j < cached.matches.length; j++) {
                        var currCachedActivity = new Date(cached.matches[j].activity),
                            prevCachedActivity = (j != 0) ? new Date(cached.matches[j - 1].activity) : null;

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
    });
})(App);