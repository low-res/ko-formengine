/* */
define([
    'knockout',
    'lodash',
    './generic-form.html!text'
], function ( ko, _, templateMarkup, styles ) {

    var p = GenericForm.prototype;

    function GenericForm( params ) {
        if(!params.formRows) throw(new Error("GenericForm needs parameter 'formRows'!"));

        console.log( "GenericForm", params );

        this.formRows       = params.formRows;
        this.source         = params.source;
        this.afterSubmit    = params.afterSubmit;
        this.inputFields     = [];

    }



    p.submit = function () {
        var isValid = this._validateForm();
        if(isValid) {
            var proxyObject = this._createProxyObject();
            console.log( proxyObject );
            if( _.isFunction(this.afterSubmit) ) this.afterSubmit( proxyObject );
        }
    }



    p._validateForm = function( ) {
        var self = this;
        var formFields = this._getFormfields( );
        return _.reduce(formFields, function( validity, fieldDef) {
            var s = ko.utils.unwrapObservable(self.source);
            var v = fieldDef.validate(null, s);
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
        _.forEach(this.inputFields, function (i) {
            var def = i.fielddef;
            if(def.name) {
                o[def.name] = i.value();
            }
        });
        return o;
    }



    p._getFormfields = function () {
        var fields = [];
        _.forEach(ko.utils.unwrapObservable(this.formRows), function (row) {
            _.forEach(row, function (def) {
                if( def.field ) {
                    fields.push(def.field);
                }
            });
        });
        return fields;
    }



    p.registerSubcomponent = function ( formfieldcomp ) {
        this.inputFields.push( formfieldcomp );
    }



    return {
        viewModel: GenericForm,
        template: templateMarkup
    };
});