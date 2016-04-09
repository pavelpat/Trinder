((App) => {
    'use strict';

    App.controller('PeopleController', function ($scope) {
        $scope.$watch('client', (value) => {
            if (value !== null) {
                $scope.refresh();
            }
        });

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
