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

        this.fielddef   = fielddef;
        this.source     = source;
        this.errors     = ko.observableArray();
        this.type       = fielddef.type || "input";
        this.id         = this.fielddef.name ? this.fielddef.name + (Math.floor(Math.random()*100000) ) : "fieldid_"+Math.floor(Math.random()*100000);
        this.isValid    = ko.pureComputed( function () {
            var err = self.errors();
            return err.length == 0;
        });
        this.context    = null; // this can be anything the inputfiled is related too. Mainlythis is meant for the form that contains this inputfield.

        if( this.fielddef.type == "select" || this.fielddef.type == "select2" ) {
            if( !this.fielddef.optionscaption ) this.fielddef.optionscaption = "general.optionscaption"
            // this is a dummy observable that is needed by select2
            this.select2Obs = ko.observable(null);
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


    p.clear = function () {
        this.setCurrentValue( null );
    }


    p.getCurrentValue = function () {
        return this.value();
    }


    p.setCurrentValue = function ( newValue ) {
        this.value( newValue );
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
            if( this.fielddef.type == "checkbox") this.value = ko.observableArray();
            else this.value = ko.observable();
        }

        this._inheritValueFromSourceObject();

        this.subscriptionForChange = this.value.subscribe(function (newValue) {
            if (!self.isValid()) self.validate();
            if(self.select2Obs) self.select2Obs(newValue);
        });

    }


    p._inheritValueFromSourceObject = function () {
        if(this.source) {
            var v = this.fielddef.getFieldValue(this.source);
            if( this.fielddef.type == "checkbox" && !_.isArray(v)) {
                v = [v];
            }
            this.value(v);
        }
    }


    return Inputfield;

});