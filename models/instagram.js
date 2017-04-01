((App) => {
    'use strict';
	
    App.factory('InstagramModel', function (BaseModel, StringField, BoolField, DateField, NumberField, ArrayField, ModelField, InstagramPhotoModel) {
        class InstagramModel extends BaseModel {}
        InstagramModel.prototype.fields = {
			'lastFetchTime': new DateField('last_fetch_time'),
			'completedInitialFetch': new BoolField('completed_initial_fetch'),
			'mediaCount': new NumberField('media_count'),
			'profilePicture': new StringField('profile_picture'),
			'username': new StringField('username'),
			'photos': new ArrayField('photos', new ModelField(null, InstagramPhotoModel))
        };
        return InstagramModel;
    });
})(App);