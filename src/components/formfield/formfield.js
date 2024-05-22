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
        var self= this;

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

        setTimeout( function () { self._initInputmask(); }, 1000 );

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
        // console.log( this.inputfield );
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
            _.each(options, function(option){
                inputfield.value.push(option);
            })
        } else {
            inputfield.value.removeAll();
        }
        inputfield.value.valueHasMutated();
    }

    // in order to use optionsText and optionsValue settings in the same manner as for select
    // we implement the handling of those settings here. They are used for checkboxes and radio buttons

    // optionsText can be a string containing the attribute name of the option object or a function
    // that returns the text for the option
    p.getOptionValue = function ( option ) {
        let optionsValue = this.inputfield.getFieldDefinition().optionsValue;
        if( optionsValue ) {
            if(_.isString(optionsValue)) {
                return ko.utils.unwrapObservable(option[optionsValue]);
            } else if(_.isFunction(optionsValue)) {
                return optionsValue(option, this.inputfield);
            }
        } else {
            return option;
        }
    }

    p.getOptionLabel = function ( option ) {
        let optionsLabel = this.inputfield.getFieldDefinition().optionsText;
        let labelprefix = this.inputfield.getFieldDefinition().labelprefix;
        if( optionsLabel ) {
            if(_.isString(optionsLabel)) {
                return ko.utils.unwrapObservable(option[optionsLabel]);
            } else if(_.isFunction(optionsLabel)) {
                return optionsLabel(option, this.inputfield);
            }
        } else {
            return kopa.translate(labelprefix+option);
        }
    }

    /******************
     *  PRIVATE METHODS
     ******************/

    p._initInputmask = function () {
        let mask = this.inputfield.getFieldDefinition().mask;
        let mask_slots = this.inputfield.getFieldDefinition().mask_slots;
        let mask_accept = this.inputfield.getFieldDefinition().mask_accept;
        if( mask && mask_slots && mask_accept ) {
            const el = document.getElementById(this.inputfield.id);
            console.log( "init inputmask", el);
            const pattern = mask,
                slots = new Set(mask_slots || "_"),
                prev = (j => Array.from(pattern, (c,i) => slots.has(c)? j=i+1: j))(0),
                first = [...pattern].findIndex(c => slots.has(c)),
                accept = new RegExp(mask_accept || "\\d", "g"),
                clean = input => {
                    input = input.match(accept) || [];
                    return Array.from(pattern, c =>
                        input[0] === c || slots.has(c) ? input.shift() || c : c
                    );
                },
                format = () => {
                    const [i, j] = [el.selectionStart, el.selectionEnd].map(i => {
                        i = clean(this.inputfield.value().slice(0, i)).findIndex(c => slots.has(c));
                        return i<0? prev[prev.length-1]: back? prev[i-1] || first: i;
                    });
                    this.inputfield.value(clean(this.inputfield.value()).join``);
                    el.setSelectionRange(i, j);
                    back = false;
                };
            let back = false;
            el.addEventListener("keydown", (e) => back = e.key === "Backspace");
            el.addEventListener("input", format);
            el.addEventListener("focus", format);
            el.addEventListener("blur", () => this.inputfield.value() === pattern && (this.inputfield.value("")));
        }

    }

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