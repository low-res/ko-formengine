/* */
define([
    'knockout',
    'lodash',
    'moment',
    'low-res/ko-utils/misc/numberParser',
    'low-res/validator',
    'low-res/ko-punches-additions',
    './generic-form.html!text'
], function ( ko, _, moment, NumberParser, Validator, Kopa, templateMarkup, styles ) {

    var p = GenericForm.prototype;

    function GenericForm( params ) {
        if(!params.formRows) throw(new Error("GenericForm needs parameter 'formRows'!"));

        console.log( "+++ GenericForm", params );

        this.formRows           = params.formRows;
        this.source             = params.source;
        this.afterSubmit        = params.afterSubmit;
        this.afterCancel        = params.afterCancel || null;
        this.form_cancel_label  = params.form_cancel_label || 'form_cancel_label'
        this.form_submit_label  = params.form_submit_label || 'form_submit_label'
        this.inputFields        = [];

        // make sure kopa filters are available
        console.log( ko.filters.translate );
        if(!ko.filters.translate) Kopa.init();
    }



    p.submit = function () {
        var isValid = this._validateForm();
        var proxyObject = null;
        if(isValid) {
            proxyObject = this._createProxyObject();
            if( _.isFunction(this.afterSubmit) ) this.afterSubmit( proxyObject );
        }
        return proxyObject;
    }



    p.cancel = function () {
        console.log( "cancel form" );
        if( _.isFunction(this.afterCancel) ) this.afterCancel(  );
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

            if( Validator.containsValidation('numerical', def.validation) ) v = NumberParser.parseFloat(v);

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