((App) => {
    'use strict';

    class Field {
        toModel(value) {
            return value;
        }
    }

    class DateField extends Field {

    }

    class BaseModel {
        get fields() {
            return {

            }
        }

        constructor(object) {
            let errors = [];

            for (let name in this.fields) {
                if (this.fields.hasOwnProperty(name)) {
                    let field = this.fields[name],
                        raw = object[name];
                    try {
                        this[name] = field.toModel(raw);
                    } catch (e) {
                        errors.push(e);
                    }
                }
            }

            if (errors.length) {
                throw errors;
            }
        }

        toObject() {
            for (let name in this) {
                if (this.fields.hasOwnProperty(name)) {
                    let field = this.fields[name],
                        raw = object[name];
                    try {
                        this[name] = field.toModel(raw);
                    } catch (e) {
                        errors.push(e);
                    }
                }
            }
        }
    }

    App.value('BaseField', BaseField);
    App.value('DateField', DateField);
    App.value('BaseModel', BaseModel);
})(App);