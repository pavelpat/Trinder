((App) => {
    'use strict';

    App.factory('PhotoModel', function (BaseModel, ArrayField, ModelField, NumberField, StringField) {
        class ProcessedPhotoModel extends BaseModel {}
        ProcessedPhotoModel.prototype.fields = {
            'width': new NumberField('width'),
            'height': new NumberField('height'),
            'url': new StringField('url')
        };

        class PhotoModel extends BaseModel {}
        PhotoModel.prototype.fields = {
            'id': new StringField('id'),
            'url': new StringField('url'),
            'processed': new ArrayField('processedFiles', new ModelField(null, ProcessedPhotoModel))
        };

        return PhotoModel;
    });
})(App);