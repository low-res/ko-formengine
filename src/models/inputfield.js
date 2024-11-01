/* */
define([
    "knockout",
    "lodash",
    "low-res/ko-fielddefinitions/field",
    "low-res/validator",
    'moment',
    'low-res/ko-utils/misc/numberParser'
], function ( ko, _, Field, Validator, moment, NumberParser ) {

    var p = Inputfield.prototype;

    function Inputfield( fielddef, source ) {
        var self = this;

        if( !(fielddef instanceof Field) ) {
            console.warn("Given fielddefinition musst be of type low-res/ko-fielddefinitions/field ! Trying to create Field-Object from given Data");
            fielddef = new Field(fielddef);
        }

        this.fielddef       = fielddef;
        this.source         = source;
        this.errors         = ko.observableArray();
        this.type           = fielddef.type || "input";
        this.keyboardtype   = fielddef.keyboardtype || "text";
        this.readonly       = fielddef.readonly ? 'readonly' : false;
        this.id             = this.fielddef.name ? this.fielddef.name + (Math.floor(Math.random()*100000) ) : "fieldid_"+Math.floor(Math.random()*100000);
        this.isValid        = ko.pureComputed( function () {
            var err = self.errors();
            return err.length == 0;
        });
        this.context        = null; // this can be anything the inputfiled is related too. Mainly this is meant for the form that contains this inputfield.

        this.selectMultiple = fielddef.multiple;
        this.selectSize     = fielddef.size || 1;
        if( this.fielddef.type == "select" || this.fielddef.type == "select2" ) {
            if( !this.fielddef.optionscaption ) this.fielddef.optionscaption = "general.optionscaption"
            // this is a dummy observable that is needed by select2
            this.select2Obs = ko.observable(null);

            // show select2 as system selectbox on mobile devices
            if( this.type == "select2" && this._isMobileDevice() ) {
                if( !_.isArray(this.fielddef.options) ) this.fielddef.options = _.values( ko.utils.unwrapObservable(this.fielddef.options) );
                this.type = "select";
            }

        }

        this._initValueObservable();
    }


    p.validate = function () {
        this.errors.removeAll();
        var v   = this.fielddef.validation;
        var res = Validator.validate( this.value(), v, this.context );
        this.errors( Validator.getLastValidationErrors() );
        this.errors.valueHasMutated();
        return res;
    }


    /**
     * this validates only if a value is available.
     * If not, the validation is always true.
     * This is meant to be used for e.g. onBlur handlers where
     * you don't want a validation error if the user just left the inputfield
     * without entering anything.
     */
    p.validateOnlyIfValue = function() {
        if( this.getCurrentValue() ) {
            return this.validate();
        }
        this.errors.removeAll();
        return true;
    }


    p.clear = function () {
        if( this._needsArrayAsValue() ) {
            this.setCurrentValue( [] );
        } else {
            this.setCurrentValue( null );
        }
    }


    p.getCurrentValue = function () {
        return this.value();
    }


    p.setCurrentValue = function ( newValue ) {
        this.value( newValue );
        if(this.select2Obs) this.select2Obs(newValue);
    }


    p.setSource = function ( source ) {
        this.source = source;
        this._inheritValueFromSourceObject();
    }


    p.setContext = function ( c ) {
        this.context = c;
    }

    /**
     * make underlying fielddefinition available
     * @return {*}
     */
    p.getFieldDefinition = function () {
        return this.fielddef;
    }


    /**
     * for sending value to server we may format the value
     * a little bit (e.g. make Numbers out of number strings or datestrings
     * from JS-Dates...
     */
    p.getValueForServer = function () {
        var rawValue = this.getCurrentValue();
        var processedValue = rawValue;

        switch( this.fielddef.type ) {
            case "date":
                if(_.isDate(rawValue)) processedValue = moment(rawValue).format('YYYY-MM-DD');
                break;

            case "select":
            case "select2":
                if( this.fielddef.optionsValue ) {
                    processedValue = _.get(rawValue, this.fielddef.optionsValue, rawValue);
                }
                break;
        }

        if( Validator.containsValidation('numerical', this.fielddef.validation) ) processedValue = NumberParser.parseFloat(rawValue);

        if( this.fielddef.valueForServerProcessor && _.isFunction(this.fielddef.valueForServerProcessor) ) {
            processedValue = this.fielddef.valueForServerProcessor( rawValue, {
                field:this.fielddef,
                source:this.source,
                context:this.context
            } );
        }

        return processedValue;
    }


    p.dispose = function () {
        this.subscriptionForChange.dispose();
    }


    // we need an observable for the input element which holds the current
    // value. If the fieldefinition does not provide it's own observable
    // we need to create a new one and fill it with the current value
    p._initValueObservable = function () {
        var self = this;

        if(this.fielddef.value) this.value = this.fielddef.value;
        else {
            if( this._needsArrayAsValue() ) this.value = ko.observableArray();
            else this.value = ko.observable();
        }

        this._inheritValueFromSourceObject();

        // somehow the display of the selected items does not work properly
        // on initialisation... as a quickfix, we refresh the list with some delay, this fixes the issue
        if( this._needsArrayAsValue() && this.value().length > 0 ) {
            setTimeout( function(){ self.value.valueHasMutated(); }, 50);
        }

        this.subscriptionForChange = this.value.subscribe(function (newValue) {
            if (!self.isValid()) self.validate();
            if(self.select2Obs) self.select2Obs(newValue);
        });
    }


    p._inheritValueFromSourceObject = function () {
        if(this.source) {
            var v = this.fielddef.getFieldValue(this.source);
            if( this._needsArrayAsValue() && !_.isArray(v) ) {
                if(v) v = [v];
                else v = [];
            }
            this.value(v);
        }
    }


    p._needsArrayAsValue = function(){
        return this.fielddef.type == "checkbox" || this.fielddef.type == "multiselect" || (this.fielddef.type == "select" && this.selectMultiple)
    }


    // borrowed from
    // https://coderwall.com/p/i817wa/one-line-function-to-detect-mobile-devices-with-javascript
    p._isMobileDevice = function() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    };


    return Inputfield;

});