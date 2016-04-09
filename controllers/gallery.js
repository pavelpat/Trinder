((App) => {
    'use strict';

    App.run(function ($rootScope) {
        $rootScope.gallery = {
            shown: false,
            slides: [],
            options: {
                history: false,
                shareEl: false
            },
            /**
             * @param {PhotoModel} photos
             * @param {number} index
             */
            open: (photos, index) => {
                $rootScope.gallery.shown = true;
                $rootScope.gallery.options.index = index;
                $rootScope.gallery.slides = photos.map((photo) => ({
                    src: photo.url,
                    w: 2048,
                    h: 2048
                }));
            },
            close: () => {
                $rootScope.gallery.shown = false;
            }
        };
    });
})(App);
