App = (function (window, angular) {
    'use strict';

    var app = angular.module('trinder', ['ui.router']);

    app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/people');
        $stateProvider.state('people', {
            url: '/people',
            reload: false,
            controller: 'PeopleController',
            templateUrl: 'templates/people.html'
        });
        $stateProvider.state('matches', {
            url: '/matches',
            reload: false,
            controller: 'MatchesController',
            templateUrl: 'templates/matches.html'
        });
    });
    
    return app;
})(window, angular);
