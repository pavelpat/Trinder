((App) => {
    'use strict';

    App.factory('MessageModel', function (BaseModel, DateField, StringField) {
        class MessageModel extends BaseModel {}
        MessageModel.prototype.fields = {
            'id': new StringField('_id'),
            'to': new StringField('to'),
            'from': new StringField('from'),
            'message': new StringField('message'),
            'sent': new DateField('sent_date')
        };

        return MessageModel;
    });
})(App);