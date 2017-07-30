((App) => {
    'use strict';

    App.factory('UserModel', function (
        BaseModel, PhotoModel, JobModel, SchoolModel, InterestModel,
        ModelField, ArrayField, BoolField, NumberField, DistanceField, StringField, DateField
    ) {
        class UserModel extends BaseModel {}
        UserModel.prototype.fields = {
            'id': new StringField('_id'),
            'create': new DateField('create_date'),
            'active': new DateField('active_time'),
            'ping': new DateField('ping_time'),
            'birth': new DateField('birth_date'),
            'ageMin': new NumberField('age_filter_min'),
            'ageMax': new NumberField('age_filter_max'),
            'bio': new StringField('bio'),
            'name': new StringField('name'),
            'fullName': new StringField('full_name'),
            'connections': new NumberField('connection_count'),
            'distance': new DistanceField('distance_filter'),
            'gender': new NumberField('gender'),
            'genderFilter': new NumberField('gender_filter'),
            'interests': new ArrayField('interests', new ModelField(null, InterestModel)),
            'discoverable': new BoolField('discoverable'),
            'photos': new ArrayField('photos', new ModelField(null, PhotoModel)),
            'jobs': new ArrayField('jobs', new ModelField(null, JobModel)),
            'schools': new ArrayField('schools', new ModelField(null, SchoolModel))
        };

        return UserModel;
    });
})(App);