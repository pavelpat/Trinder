((App) => {
    'use strict';

    App.factory('ActionModel', function (
        BaseModel, ModelField, PersonModel, StringField, DateField
    ) {
        class ActionModel extends BaseModel {}
        ActionModel.prototype.fields = {
            'created': new DateField('created'),
            'action': new StringField('action'),
            'person': new ModelField('person', PersonModel)
        };

        return ActionModel;
    });
})(App);