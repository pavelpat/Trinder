App = (function (window, angular) {
    'use strict';

    var app = angular.module('trinder', [
        'ui.router',
        'ngPhotoswipe',
        'leaflet-directive'
    ]);

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
        $stateProvider.state('settings', {
            url: '/settings',
            reload: false,
            controller: 'SettingsController',
            templateUrl: 'templates/settings.html'
        });
    });
    
    return app;
})(window, angular);
