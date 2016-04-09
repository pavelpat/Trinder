((navigator, App) => {
    'use strict';

    App.value('Geo', () => new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((geo) => {
            resolve([geo.coords.latitude, geo.coords.longitude]);
        });
    }));
})(navigator, App);
