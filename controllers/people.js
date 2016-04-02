((App) => {
    'use strict';

    App.controller('PeopleController', function ($scope, ReadyClient) {
        // Auth section.
        $scope.client = null;
        $scope.person = null;

        ReadyClient.then((cp) => {
            $scope.client = cp.client;
            $scope.person = cp.person;
            $scope.refresh();
            $scope.$apply();
        });

        // Gallery section.
        $scope.gallery = {
            shown: false,
            options: {
                history: false,
                shareEl: false
            },
            slides: []
        };

        $scope.gallery.open = (photos, index) => {
            $scope.gallery.shown = true;
            $scope.gallery.options.index = index;
            $scope.gallery.slides = photos.map((photo) => {
                return {
                    src: photo.url,
                    w: 2048,
                    h: 2048
                }
            });
        };

        $scope.gallery.close = () => {
            $scope.gallery.shown = false;
        };

        // Main section.
        $scope.people = [];
        $scope.loading = false;

        $scope.like = (person) => {
            $scope.loading = true;
            $scope.client.like(person.id).then(() => {
                var index = $scope.people.indexOf(person);
                if (index > -1) {
                    $scope.people.splice(index, 1);
                }
                $scope.loading = false;
                $scope.$apply();
            }, () => {
                $scope.loading = false;
                $scope.$apply();
            })
        };

        $scope.pass = (person) => {
            $scope.loading = true;
            $scope.client.pass(person.id).then(() => {
                var index = $scope.people.indexOf(person);
                if (index > -1) {
                    $scope.people.splice(index, 1);
                }
                $scope.loading = false;
                $scope.$apply();
            }, () => {
                $scope.loading = false;
                $scope.$apply();
            })
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
    });
})(App);
