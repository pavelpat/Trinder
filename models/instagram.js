((App) => {
    'use strict';

    App.factory('InstagramModel', function (BaseModel, ArrayField, ModelField, StringField) {
        class PhotoModel extends BaseModel {}
        PhotoModel.prototype.fields = {
            'url': new StringField('image'),
            'processed': new StringField('thumbnail')
        };

        class InstagramModel extends BaseModel {}
        InstagramModel.prototype.fields = {
            'picture': new StringField('profile_picture'),
            'username': new StringField('username'),
            'photos': new ArrayField('photos', new ModelField(null, PhotoModel))
        };

        return InstagramModel;
    });
})(App);