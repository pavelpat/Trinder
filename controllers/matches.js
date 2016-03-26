(function (App) {
    'use strict';
    
    App.controller('MatchesController', function ($scope) {
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

            var date = new Date();
            date.setTime(date.getTime() - 1000 * 60 * 60 * 24 * 31);

            $scope.client.updates(date).then(function (updates) {
                updates.matches.sort(function (a, b) {
                    return b.lastActivity.getTime() - a.lastActivity.getTime();
                });
                updates.matches.forEach(function (match) {
                    match.messages.sort(function (a, b) {
                        return b.sent.getTime() - a.sent.getTime();
                    });
                });
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

        $scope.clientReady.then(function(){
            $scope.refresh();
            $scope.$apply();
        });
    })
})(App);