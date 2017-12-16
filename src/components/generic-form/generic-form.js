/* */
define([
    'knockout',
    'lodash',
    'jquery',
    'moment',
    '../../models/form',
    'low-res/ko-utils/misc/numberParser',
    'low-res/validator',
    'low-res/ko-punches-additions',
    './generic-form.html!text'
], function ( ko, _, $, moment, Form, NumberParser, Validator, Kopa, templateMarkup ) {

    var p = GenericForm.prototype;

    function GenericForm( params ) {
        if(!params.formRows && !params.form) throw(new Error("GenericForm needs either parameter 'formRows' or 'form'!"));

        if(params.form) {
            this.form               = ko.utils.unwrapObservable(params.form);
        } else {
            console.warn( "Using params fielddef and source is deprecated for this component and will be removed soon. Please use param 'form' and provide an Form object! " );
            this.form               = new Form(params.formRows, params.source);
        }

        this.afterSubmit        = params.afterSubmit;
        this.afterCancel        = params.afterCancel || null;
        this.form_cancel_label  = params.form_cancel_label || 'form_cancel_label'
        this.form_submit_label  = params.form_submit_label || 'form_submit_label'
        this.showButtons        = ko.observable( true  );
        if(params.showButtons)  this.showButtons(params.showButtons);

        // make sure kopa filters are available
        if(!ko.filters.translate) Kopa.init();
    }



    p.submit = function () {
        console.log( "submit" );
        var isValid = this.form.validate();
        var proxyObject = null;
        if(isValid) {
            proxyObject = this.form.getValues();
            if( _.isFunction(this.afterSubmit) ) this.afterSubmit( proxyObject );
        } else {
            setTimeout( function () {
                $('html, body').animate({
                    scrollTop: $(".errorindicator").eq(0).parent().offset().top
                }, 500);
            }, 500);

        }
        return proxyObject;
    }



    p.cancel = function () {
        console.log( "cancel form" );
        if( _.isFunction(this.afterCancel) ) this.afterCancel(  );
    }


    return {
        viewModel: GenericForm,
        template: templateMarkup
    };
});