define([
    'jquery',
    'knockout',
    'lodash',
    'low-res/validator',
    'low-res/ko-fielddefinitions/fieldsCollection',
    '../../../models/form',
    '../../../models/inputfield',
    'moment',
    './datepickerTz-view.html!text',
    './datepickerTz-styles.css!css',
    'moment-timezone'

], function ($, ko, _, Validator, FieldsCollection, Form, Inputfield, moment, templateMarkup) {

    var p = DatepickerTzInputField.prototype;

    function DatepickerTzInputField( params ) {
        var self = this;

        this.tzSelectionactive = ko.observable(true);
        this.inputfield = params.inputfield;

        this.source = self.inputfield.value();
        if(_.isString( self.inputfield.value() )) this.source = JSON.parse( self.inputfield.value() || "{}" );

        // we need to format the date (YYYY-MM-DDTHH:MM+HH:MM), because the inputfield expects a string in the format YYYY-MM-DDTHH:MM
        // also we assume we are getting an UTC date. Then we convert it to the given Timezone.
        let dateStr = this.source.date ? this.source.date.substring(0, 16) : moment().format('YYYY-MM-DDTHH:mm');
        let timezone = this.source.tz || "UTC";
        let date = moment.tz(dateStr, "UTC").tz(timezone);
        this.source.date = date.format('YYYY-MM-DDTHH:mm');

        let validationDate = this.inputfield.getFieldDefinition().validation || "";
        let validationTZ = validationDate != "" ? "required" : "";
        this.tzinput    = new Inputfield({name:'tz', type:'select', label:'', valueAccessor:'tz', options: params.inputfield.getFieldDefinition().timezones, validation:validationTZ}, this.source);
        this.dateinput  = new Inputfield({name:'date', type:'input', keyboardtype:'datetime-local', label:'', valueAccessor:'date', format:'YYYY-MM-DD', validation:validationDate }, this.source);
        this.dateinput.setContext( this.inputfield.context );
        this.tzinput.value.subscribe( function(){self.updateInputfiledValue();} );
        this.dateinput.value.subscribe( function(){self.updateInputfiledValue();} );

        this.inputfield.validate = function() {
            console.log("overridden validate() method");
            let res = self.tzinput.validate() && self.dateinput.validate();

            if( res ) {
                self.updateInputfiledValue();
            }
            return res;
        }
    }

    // take the values from date and timezone a generate JSON representation for the inputfield
    p.updateInputfiledValue = function(){
        let d = this.dateinput.getValueForServer();
        let tz = this.tzinput.getValueForServer();
        let r = moment.tz(d, tz);
        let u = r.clone().tz("UTC");
        console.log("moment", r.format() );
        let currentvalue = JSON.stringify( {
            tz: tz,
            date: u.format()
        })
        this.inputfield.value( currentvalue );
    }

    p.initComponent = function ( node ) {
        var self = this;

        this.tzSelect = $(node);//.find('select');
        console.log("tzSelect", this.tzSelect);

        return true;
    }

    return {
        viewModel: {
            createViewModel: function( params, elementInfo ) {
                console.log( "new DatepickerTzInputField", elementInfo );
                var instance = new DatepickerTzInputField( params );
                return instance;
            }
        },
        template: templateMarkup
    };

});