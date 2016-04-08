((App) => {
    'use strict';

    App.factory('PhotoModel', function (BaseModel, StringField) {
        class PhotoModel extends BaseModel {}
        PhotoModel.prototype.fields = {
            'id': new StringField('id'),
            'url': new StringField('url')
        };

        return PhotoModel;
    });
})(App);