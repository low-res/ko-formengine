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
        this.isValid    = ko.pureComputed( function () {
            self.errors().length == 0;
        });

        this._initValueObservable();
    }


    p.validate = function () {
        this.errors.removeAll();
        var v   = this.fielddef.validation;
        var res = Validator.validate( this.value(), v );
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
        }

        if( Validator.containsValidation('numerical', this.fielddef.validation) ) processedValue = NumberParser.parseFloat(rawValue);

        return processedValue;
    }


    // we need an observable for the input element which holds the current
    // value. If the fieldefinition does not provide it's own observable
    // we need to create a new one and fill it with the current value
    p._initValueObservable = function () {
        if(this.fielddef.value) this.value = this.fielddef.value;
        else this.value = ko.observable();

        this._inheritValueFromSourceObject();

    }

    p._inheritValueFromSourceObject = function () {
        if(this.source) {
            var v = this.fielddef.getFieldValue(this.source);
            this.value(v);
        }
    }


    return Inputfield;

});