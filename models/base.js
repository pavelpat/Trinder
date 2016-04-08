((ng, App) => {
    'use strict';

    class BaseField {
        /**
         * @param {string|null} attr
         */
        constructor(attr) {
            this.attr = attr || null;
        }

        toModel(value) {
            return value;
        }

        toObject(value) {
            return value;
        }
    }

    class BoolField extends BaseField {
        /**
         * @param {*} value
         * @returns {bool}
         */
        toModel(value) {
            return !!value;
        }

        /**
         * @param {*} value
         * @returns {bool}
         */
        toObject(value) {
            return !!value * 1;
        }
    }

    class NumberField extends BaseField {
        /**
         * @param {*} value
         * @returns {number}
         */
        toModel(value) {
            return value * 1;
        }

        /**
         * @param {*} value
         * @returns {number}
         */
        toObject(value) {
            return value * 1;
        }
    }

    class StringField extends BaseField {
        /**
         * @param {*} value
         * @returns {string}
         */
        toModel(value) {
            return value + '';
        }

        /**
         * @param {*} value
         * @returns {string}
         */
        toObject(value) {
            return value + '';
        }
    }

    class DateField extends BaseField {
        toModel(value) {
            return new Date(value);
        }

        /**
         * @param {Date} value
         * @returns {string}
         */
        toObject(value) {
            return value.toISOString();
        }
    }

    class ArrayField extends BaseField {
        /**
         * @param {string|null} attr
         * @param {BaseField} field
         */
        constructor(attr, field) {
            super(attr);
            this.field = field;
        }

        /**
         * @param {Array} value
         * @returns {Array}
         */
        toModel(value) {
            let result = [];
            for (let i = 0; i < (value || []).length || 0; i++) {
                result.push(this.field.toModel(value[i]));
            }
            return result;
        }

        /**
         * @param {Array} value
         * @returns {Array}
         */
        toObject(value) {
            let result = [];
            for (let i = 0; i < (value || []).length; i++) {
                result.push(this.field.toObject(value[i]));
            }
            return result;
        }
    }

    class ModelField extends BaseField {
        /**
         * @param {string|null} attr
         * @param {BaseModel} model
         */
        constructor(attr, model) {
            super(attr);
            this.model = model;
        }

        /**
         * @param {Object} value
         * @returns {BaseModel}
         */
        toModel(value) {
            return new this.model(value);
        }

        /**
         * @param {BaseModel} value
         * @returns {Object}
         */
        toObject(value) {
            return value.toObject();
        }
    }

    class BaseModel {
        /**
         * @param {Object} value
         */
        constructor(value) {
            for (let key in this.fields) {
                let field = this.fields[key];
                if (field instanceof BaseField) {
                    this[key] = value ? field.toModel(value[field.attr || key]) : null;
                }
            }
        }

        /**
         * @returns {Object}
         */
        toObject() {
            let result = {};
            for (let key in this.fields) {
                let field = this.fields[key];
                if (field instanceof BaseField) {
                    result[field.attr || key] = field.toObject(this[key]);
                }
            }
            return result;
        }
    }

    // Default value for fields.
    BaseModel.prototype.fields = {};

    App.value('BoolField', BoolField);
    App.value('NumberField', NumberField);
    App.value('StringField', StringField);
    App.value('DateField', DateField);
    App.value('ArrayField', ArrayField);
    App.value('ModelField', ModelField);
    App.value('BaseModel', BaseModel);
})(angular, App);