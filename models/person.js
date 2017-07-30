((App) => {
    'use strict';

    App.factory('PersonModel', function (
        BaseModel, PhotoModel, InstagramModel, JobModel, SchoolModel,
        ModelField, ArrayField, NumberField, DistanceField, StringField, DateField
    ) {
        class PersonModel extends BaseModel {}
        PersonModel.prototype.fields = {
            'id': new StringField('_id'),
            'ping': new DateField('ping_time'),
            'birth': new DateField('birth_date'),
            'distance': new DistanceField('distance_mi'),
            'bio': new StringField('bio'),
            'name': new StringField('name'),
            'gender': new NumberField('gender'),
            'commonLikes': new ArrayField('common_likes', new StringField(null)),
            'commonFriends': new ArrayField('common_friends', new StringField(null)),
            'commonInterests': new ArrayField('common_interests', new StringField(null)),
            'photos': new ArrayField('photos', new ModelField(null, PhotoModel)),
            'jobs': new ArrayField('jobs', new ModelField(null, JobModel)),
            'schools': new ArrayField('schools', new ModelField(null, SchoolModel)),
            'instagram': new ModelField('instagram', InstagramModel)
        };

        return PersonModel;
    });
})(App);