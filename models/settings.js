((App) => {
    'use strict';

    App.factory('SettingsModel', function (BaseModel, BoolField, NumberField) {
        class SettingsModel extends BaseModel {}
        SettingsModel.prototype.fields = {
            'geolocation': new BoolField('geolocation'),
            'geolat': new NumberField('geolat'),
            'geolon': new NumberField('geolon')
        };

        return SettingsModel;
    });
})(App);