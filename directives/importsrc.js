(function (App) {
    'use strict';

    var loaderUrl = 'images/ajax-loader.gif';

    App.directive('importSrc', function (ImportBlob) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (attrs.importSrc) {
                    element.attr('src', loaderUrl);
                    ImportBlob.url(attrs.importSrc).then(function (blobUrl) {
                        element.attr('src', blobUrl);
                    });
                }
            }
        };
    });
})(App);