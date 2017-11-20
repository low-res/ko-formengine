/* */
define([
    'knockout',
    'lodash',
    'moment',
    './generic-form.html!text'
], function ( ko, _, moment, templateMarkup, styles ) {

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
        var formFields = this.inputFields;
        return _.reduce(formFields, function( validity, inputfield) {
            var v = inputfield.validate();
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
            var v = i.value();
            switch( def.type ) {
                case "date":
                    if(_.isDate(v)) v = moment(v).format('YYYY-MM-DD');
                    break;
            }
            if(def.name) {
                _.set(o, def.name, v);
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