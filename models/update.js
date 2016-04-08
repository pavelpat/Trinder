((App) => {
    'use strict';

    App.factory('UpdateModel', function (BaseModel, PersonModel, ArrayField, ModelField, DateField, StringField) {
        class MessageModel extends BaseModel {}
        MessageModel.prototype.fields = {
            'id': new StringField('_id'),
            'to': new StringField('to'),
            'from': new StringField('from'),
            'message': new StringField('message'),
            'sent': new DateField('sent_date')
        };

        class MatchModel extends BaseModel {}
        MatchModel.prototype.fields = {
            'id': new StringField('_id'),
            'lastActivity': new DateField('last_activity_date'),
            'person': new ModelField('person', PersonModel),
            'messages': new ArrayField('messages', new ModelField(null, MessageModel))
        };

        class UpdateModel extends BaseModel {}
        UpdateModel.prototype.fields = {
            'lastActivity': new DateField('last_activity_date'),
            'matches': new ArrayField('matches', new ModelField(null, MatchModel))
        };

        return UpdateModel;
    });
})(App);