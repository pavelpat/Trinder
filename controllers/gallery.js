(function (Main) {
    'use strict';

    App.controller('GalleryController', function ($scope, ImportBlob) {
        $scope.galleryOpened = false;
        $scope.galleryImages = [];
        $scope.galleryOptions = {
            history: false
        };
        $scope.galleryOpen = function(photos, index) {
            Promise.all(photos.map(function(item){
                return ImportBlob.url(item.url)
            })).then(function (urls) {
                $scope.galleryImages = urls.map(function (url) {
                    return {
                        src: url,
                        w: 500,
                        h: 500
                    }
                });
                $scope.galleryOpened = true;
                $scope.$apply();
            });
        };
    });
})(App);
