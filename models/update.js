((App) => {
    'use strict';

    App.factory('UpdateModel', function (
        BaseModel, PersonModel, MessageModel, MatchModel,
        ArrayField, ModelField, DateField
    ) {
        class UpdateModel extends BaseModel {}
        UpdateModel.prototype.fields = {
            'activity': new DateField('last_activity_date'),
            'matches': new ArrayField('matches', new ModelField(null, MatchModel))
        };

        return UpdateModel;
    });
})(App);