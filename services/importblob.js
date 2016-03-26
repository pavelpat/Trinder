(function (App, URL) {
    'use strict';

    App.service('ImportBlob', function(){
        this.url = function(url) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        resolve(URL.createObjectURL(this.response));
                    }
                };
                xhr.onerror = function () {
                    reject(arguments);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            });
        };
    });
})(App, URL);