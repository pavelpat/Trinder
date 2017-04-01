((App) => {
    'use strict';

    App.factory('InstagramPhotoModel', function (BaseModel, StringField) {
        class InstagramPhotoModel extends BaseModel {}
        InstagramPhotoModel.prototype.fields = {
            'url': new StringField('image'),
            'thumbnail': new StringField('thumbnail'),
            'ts': new StringField('ts'),
			'link': new StringField('link')
        };

        return InstagramPhotoModel;
    });
})(App);