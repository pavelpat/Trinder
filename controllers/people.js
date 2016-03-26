(function (Main) {
    'use strict';

    App.controller('PeopleController', function ($scope) {
        $scope.gallery = {
            shown: false,
            options: {
                history: false,
                shareEl: false
            },
            slides: [],
            open: function (photos, index) {
                $scope.gallery.shown = true;
                $scope.gallery.options.index = index;
                $scope.gallery.slides = photos.map(function(photo) {
                    return {
                        src: photo.url,
                        w: 2048,
                        h: 2048
                    }
                });
            },
            close: function () {
                $scope.gallery.shown = false;
            }
        };

        $scope.people = [];
        $scope.loading = false;

        $scope.like = function(person) {
            $scope.loading = true;
            $scope.client.like(person.id).then(function () {
                var index = $scope.people.indexOf(person);
                if (index > -1) {
                    $scope.people.splice(index, 1);
                }
                $scope.loading = false;
                $scope.$apply();
            }, function () {
                $scope.loading = false;
                $scope.$apply();
            })
        };

        $scope.pass = function (person) {
            $scope.loading = true;
            $scope.client.pass(person.id).then(function () {
                var index = $scope.people.indexOf(person);
                if (index > -1) {
                    $scope.people.splice(index, 1);
                }
                $scope.loading = false;
                $scope.$apply();
            }, function () {
                $scope.loading = false;
                $scope.$apply();
            })
        };

        $scope.refresh = function () {
            $scope.loading = true;
            $scope.client.recs().then(function (recs) {
                $scope.people = recs;
                $scope.loading = false;
                $scope.$apply();
            }, function () {
                $scope.people = [];
                $scope.loading = false;
                $scope.$apply();
            });
        };

        $scope.clientReady.then(function () {
            $scope.refresh();
            $scope.$apply();
        });
    });
})(App);
