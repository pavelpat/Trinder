((App) => {
    'use strict';

    App.factory('MatchModel', function (
        BaseModel, PersonModel, MessageModel,
        ArrayField, ModelField, DateField, StringField
    ) {
        class MatchModel extends BaseModel {}
        MatchModel.prototype.fields = {
            'id': new StringField('_id'),
            'activity': new DateField('last_activity_date'),
            'person': new ModelField('person', PersonModel),
            'messages': new ArrayField('messages', new ModelField(null, MessageModel))
        };

        return MatchModel;
    });
})(App);