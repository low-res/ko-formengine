/* */
define([
    'knockout',
    'lodash',
    'jquery',
    'low-res/validator',
    './formfield.html!text',
    './formfield.css!css'
], function (ko, _, $, Validator, templateMarkup) {

    var p = FormfieldWidget.prototype;

    function FormfieldWidget(params) {
        var self                = this;

        this.fielddef           = params.fielddef;
        this.useInlineErrors    = ko.observable( false || params.useInlineErrors );
        this.tabindex           = params.tabindex || 0;
        this.source             = ko.utils.unwrapObservable(params.source);
        this.hidden             = params.hidden || false;
        this.fieldlabelclass    = ko.pureComputed( function () {
            var res = Validator.containsValidation('required', self.fielddef.validation) ? 'required' : '';
            return res;
        });
        this.fieldId            = ko.pureComputed( function () {
           return self.fielddef.name+(Math.random()*100000);
        });

        // default form type is input
        if(!this.fielddef.type) this.fielddef.type = "input";

        // every select has a caption
        if( this.fielddef.type == "select" ) {
            if( !this.fielddef.optionscaption ) this.fielddef.optionscaption = "general.optionscaption"
        }


        this.isValid = ko.pureComputed( function () {
            if(self.fielddef.isValid) {
                return ko.utils.unwrapObservable(self.fielddef.isValid);
            } else {
                return true;
            }
        })

        this.errors = ko.pureComputed( function () {
            var res = "";
            if(self.fielddef.errors) {
                var err = self.fielddef.errors();
                res = _.reduce(err, function (msg, error) {
                    return msg + window.kopa.translate(error) + "<br>" ;
                }, "");
                if(!_.isEmpty(res))console.log( "error",self.fielddef.name,  res );
            }
            return res;
        });

        // we need an observable for the input element which holds the current
        // value. If the fieldefinition does not provide it's own observable
        // we need to create a new one and fill it with the current value
        if(this.fielddef.value) this.value = this.fielddef.value;
        else this.value = ko.observable();
        if(this.source) {
            var v = this.fielddef.getFieldValue(this.source);
            this.value(v);
        }
        this.fielddef.value = this.value;
        if( this.fielddef.isValid ) this.fielddef.isValid(true);
        if( this.fielddef.errors ) this.fielddef.errors([]);

        this.subscriptionForChange = this.value.subscribe(function (newValue) {
            if (self.fielddef.isValid && !self.fielddef.isValid()) self.fielddef.validate(null, self.source);
            // console.log( "field changed to ", newValue );
        });

        // this is a dummy observable that is needed by select2
        this.select2Obs = ko.observable(null);
    }



    /******************
     *  PUBLIC API
     ******************/

    p.handleCalendarIconClick = function ( widget, event ) {
        console.log( "handleCalendarIconClick" );
        var $icon = $(event.currentTarget);
        console.log( $icon );
        var $inputField = $icon.prev('input');
        $inputField.focus();
        console.log( "handleCalendarIconClick", $inputField );
    }


    p.validate = function () {
        return this.fielddef.validate();
    }

    /**
     * generate unique id for formelement
     * this is especially needed for radiobuttons and checkboxes
     */
    p.calculateInputId = function ( fielddata ) {
        var id = this.fieldId+ko.utils.unwrapObservable(fielddata);
        return
    }

    /******************
     *  PRIVATE METHODS
     ******************/

    p.dispose = function () {
        console.log( "-- dispose FormfieldWidget --" );
        this.subscriptionForChange.dispose();
    };



    return {
        viewModel: {
            createViewModel: function( params, elementInfo ) {
                var instance = new FormfieldWidget( params );
                var context = ko.contextFor(elementInfo.element);
                var parentForm = context.$parents[1];
                if( parentForm.registerSubcomponent ) {
                    parentForm.registerSubcomponent( instance );
                }
                return instance;
            }
        },
        template: templateMarkup,
        synchronous: true,
        component:'formfield'
    };
});