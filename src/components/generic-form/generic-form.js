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
    './generic-form.html!text',
    'moment-timezone'
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

        if( params.afterSubmit ) {
            console.warn( "Using the 'afterSubmit' parameter is deprecated! Please use the addSubmitHandler method of the form-object to define your submit callback." );
            this.form.addSubmitHandler( params.afterSubmit );
        }
        if( params.afterCancel ) {
            console.warn( "Using the 'afterCancel' parameter is deprecated! Please use the addDismissHandler method of the form-object to define your submit callback." );
            this.form.addDismissHandler( params.afterCancel );
        }

        this.form_cancel_label  = params.form_cancel_label || 'form_cancel_label'
        this.form_submit_label  = params.form_submit_label || 'form_submit_label'
        this.showButtons        = ko.observable( true  );
        this.showCancelButton   = this.form.dismissHandlers.length > 0;
        if(params.showButtons!=undefined)  this.showButtons(params.showButtons);

        // make sure kopa filters are available
        if(!ko.filters.translate) Kopa.init();

        console.log(this.form);
    }


    p.submit = function () {
        console.log( "submit" );
        var isValid = this.form.validate();
        var proxyObject = null;
        if(isValid) {
            this.form.submit();
        } else {
            console.log("Validation Failed", isValid);
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
        this.form.dismiss();
    }


    return {
        viewModel: GenericForm,
        template: templateMarkup
    };
});