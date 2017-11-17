define([
    'knockout',
    'lodash',
    './generic-form.html!text'
], function ( ko, _, templateMarkup, styles ) {

    var p = GenericForm.prototype;

    function GenericForm( params ) {
        if(!params.formRows) throw(new Error("GenericForm needs parameter 'formRows'!"));
        this.formRows       = params.formRows;
        this.source         = params.source;
        this.afterSubmit    = params.afterSubmit;
        this.proxyObject    = this._createProxyObject();
    }


    p.submit = function () {
        var isValid = this._validateForm();
        if(isValid) {
            if( _.isFunction(this.afterSubmit) ) this.afterSubmit();
        }
    }


    p._validateForm = function( ) {
        var formFields = this.getCollectionFields( collectionName );
        return _.reduce(self._getFormfields(), function( validity, fieldDef) {
            var v = fieldDef.validate();
            return validity && v;
        }, true);
    }


    /**
     * create an object for holding the values that are edited inside the
     * form. If possible prefill with corresponding value of source object.
     * @private
     */
    p._createProxyObject = function () {
        var self = this;
        var o = {};
        _.forEach(self._getFormfields(), function (def) {
            if(def.field && def.field.name) {
                var sourceValue = def.field.getFieldValue(self.source);
                o[def.field.name] = sourceValue;
            }
        });
        return o;
    }



    p._getFormfields = function () {
        var fields = [];
        _.forEach(ko.utils.unwrapObservable(self.formRows), function (row) {
            _.forEach(row, function (def) {
                if( def.field ) {
                    fields.push(def.field);
                }
            });
        });
        return fields;
    }




    return {
        viewModel: GenericForm,
        template: templateMarkup
    };
});