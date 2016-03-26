(function (Main) {
    'use strict';

    App.controller('PeopleController', function ($scope) {
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
