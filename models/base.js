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

        empty(value) {
            return value === null || value === undefined;
        }
    }

    class BoolField extends BaseField {
        /**
         * @param {*} value
         * @returns {bool|null}
         */
        toModel(value) {
            if (this.empty(value)) return null;
            return !!value;
        }

        /**
         * @param {*} value
         * @returns {bool|null}
         */
        toObject(value) {
            if (this.empty(value)) return null;
            return !!value;
        }
    }

    class NumberField extends BaseField {
        /**
         * @param {*} value
         * @returns {number|null}
         */
        toModel(value) {
            if (this.empty(value)) return null;
            return value * 1;
        }

        /**
         * @param {*} value
         * @returns {number|null}
         */
        toObject(value) {
            if (this.empty(value)) return null;
            return value * 1;
        }
    }

    class StringField extends BaseField {
        /**
         * @param {*} value
         * @returns {string|null}
         */
        toModel(value) {
            if (this.empty(value)) return null;
            return value + '';
        }

        /**
         * @param {*} value
         * @returns {string|null}
         */
        toObject(value) {
            if (this.empty(value)) return null;
            return value + '';
        }
    }

    class DateField extends BaseField {
        /**
         * @param {*} value
         * @returns {Date|null}
         */
        toModel(value) {
            if (this.empty(value)) return null;
            return new Date(value);
        }

        /**
         * @param {Date} value
         * @returns {string|null}
         */
        toObject(value) {
            if (this.empty(value)) return null;
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
         * @returns {Array|null}
         */
        toModel(value) {
            if (this.empty(value)) return null;
            return (value || []).map((v) => this.field.toModel(v));
        }

        /**
         * @param {Array|null} value
         * @returns {Array}
         */
        toObject(value) {
            if (this.empty(value)) return null;
            return (value || []).map((v) => this.field.toObject(v));
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
            if (this.empty(value)) return null;
            return new this.model(value);
        }

        /**
         * @param {BaseModel} value
         * @returns {Object}
         */
        toObject(value) {
            if (this.empty(value)) return null;
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
                    this[key] = field.toModel(value[field.attr || key]);
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