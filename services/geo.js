((navigator, App) => {
    'use strict';

    App.value('Geo', new class Geo {
        position() {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition((geo) => {
                    resolve([geo.coords.latitude, geo.coords.longitude]);
                });
            });
        }
        distance(lat1, lon1, lat2, lon2) {
            return 111.2 * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
        }
    });
})(navigator, App);


