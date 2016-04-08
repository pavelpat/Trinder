((App) => {
    'use strict';

    App.factory('JobModel', function (BaseModel, ModelField, StringField) {
        class CompanyModel extends BaseModel {}
        CompanyModel.prototype.fields = {
            'name': new StringField('name')
        };

        class JobModel extends BaseModel {}
        JobModel.prototype.fields = {
            'company': new ModelField('company', CompanyModel)
        };

        return JobModel;
    });
})(App);