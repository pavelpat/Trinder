((App) => {
    'use strict';

    App.factory('InterestModel', function (BaseModel, StringField) {
        class InterestModel extends BaseModel {}
        InterestModel.prototype.fields = {
            'id': new StringField('id'),
            'name': new StringField('name')
        };

        return InterestModel;
    });
})(App);