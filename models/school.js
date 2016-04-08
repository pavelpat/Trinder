((App) => {
    'use strict';

    App.factory('SchoolModel', function (BaseModel, StringField) {
        class SchoolModel extends BaseModel {}
        SchoolModel.prototype.fields = {
            'id': new StringField('id'),
            'name': new StringField('name')
        };

        return SchoolModel;
    });
})(App);