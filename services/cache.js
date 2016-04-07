((App) => {
    'use strict';

    App.factory('Cache', (Store) => class Cache {
        constructor() {
            this.store = new Store('Cache');
        }

        get profile() {
            return this.matches.get('profile').catch(() => ({}));
        }

        set profile(value) {
            this.matches.set('profile', value);
        }

        get activity() {
            return this.matches.get('activity').then((activity) => {
                return new Date(activity);
            }, () => {
                var activity = new Date(),
                    interval = 1000 * 60 * 60 * 24 * 31 * 12 * 10;
                activity.setTime(activity.getTime() - interval);
                return activity;
            });
        }

        set activity(value) {
            this.matches.set('activity', value.toISOString());
        }

        get matches() {
            return this.matches.get('matches').catch(() => []);
        }

        set matches(value) {
            this.matches.set('matches', value);
        }

        reset() {
            return Promise.all([
                this.store.remove('profile'),
                this.store.remove('activity'),
                this.store.remove('matches')
            ]);
        }
    });
})(App);
