/* */
define([
    'knockout',
    'lodash',
    'jquery',
    'low-res/validator',
    '../../models/inputfield',
    './formfield.html!text',
    './formfield.css!css'
], function (ko, _, $, Validator, Inputfield, templateMarkup) {

    var p = FormfieldWidget.prototype;

    function FormfieldWidget(params) {
        var self                = this;

        this.fielddef           = params.fielddef;
        this.source             = ko.utils.unwrapObservable(params.source);

        if( params.inputfield ) {
            this.inputfield     = ko.utils.unwrapObservable(params.inputfield);
            if(!this.inputfield) console.error( "Missing Inputfiled Object! Given was ", this.inputfield  );
        } else {
            console.warn( "Using params fielddef and source is deprecated for this component and will be removed soon. Please use param 'inputfield' and provide an Inputfiled object! " );
            this.inputfield     = new Inputfield(this.fielddef, this.source);
        }

        this.useInlineErrors    = ko.observable( false || params.useInlineErrors || this.inputfield.fielddef.useInlineErrors );
        this.tabindex           = params.tabindex || 0;
        this.hidden             = params.hidden || false;
        this.showLabels         = params.showLabels !== false;
        this.fieldlabelclass    = ko.pureComputed( function () {
            var res = Validator.containsValidation('required', self.inputfield.getFieldDefinition().validation) ? 'required' : '';
            return res;
        });

        this.errors = ko.pureComputed( function () {
            var res = "";
            if(self.inputfield.errors().length > 0) {
                res = window.kopa.translate(self.inputfield.errors()[0]);
            }
            return res;
        });

    }



    /******************
     *  PUBLIC API
     ******************/

    p.handleCalendarIconClick = function ( widget, event ) {
        var $icon = $(event.currentTarget);
        var $inputField = $icon.prev('input');
        $inputField.focus();
    }


    p.validate = function () {
        return this.inputfield.validate();
    }


    /**
     * generate unique id for formelement
     * this is especially needed for radiobuttons and checkboxes
     */
    p.calculateInputId = function ( fielddata ) {
        var id = this.inputfield.id+ko.utils.unwrapObservable(fielddata);
        return id;
    }


    p.calculateCssClass = function () {
        console.log( this.inputfield );
        var classes = ['ko-formengine-field','type-'+this.inputfield.type];
        if(!this.inputfield.isValid()) classes.push('error');
        if(this.inputfield.getFieldDefinition().info) classes.push('hasLabelInfo');
        return classes.join(' ');
    }


    p.toggleall = function( inputfield ) {
        if(!inputfield.toggleAll) inputfield.toggleAll = false;
        inputfield.toggleAll = !inputfield.toggleAll;

        if(inputfield.toggleAll) {
            var options = ko.utils.unwrapObservable(inputfield.getFieldDefinition().options);
            console.log(options);
            _.each(options, function(option){
                inputfield.value.push(option);
            })
        } else {
            inputfield.value.removeAll();
        }
        inputfield.value.valueHasMutated();

        console.log(inputfield.value());
    }

    /******************
     *  PRIVATE METHODS
     ******************/

    p.dispose = function () {
        console.log( "-- dispose FormfieldWidget --" );
        this.inputfield.dispose();
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