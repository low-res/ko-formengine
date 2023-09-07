define([
    'knockout',
    'lodash',
    'low-res/validator',
    'low-res/ko-fielddefinitions/fieldsCollection',
    '../../../models/form',
    'moment',
    './datepickerTz-view.html!text',
    './datepickerTz-styles.css!css',
    'moment-timezone'
], function (ko, _, Validator, FieldsCollection, Form, moment, templateMarkup) {

    var p = DatepickerTzInputField.prototype;

    function DatepickerTzInputField( params ) {
        var self = this;
        this.inputfield = params.inputfield;

        this.fields = new FieldsCollection({
            fields: [
                {name:'tz', type:'select', label:'Timezone', valueAccessor:'tz', options: params.inputfield.getFieldDefinition().timezones},
                {name:'date', type:'input', keyboardtype:'datetime-local', label:'Date', valueAccessor:'date', format:'YYYY-MM-DD' },
            ],
            collections:[
                {name:'edit', fields:['tz', 'date'] }
            ]
        });

        this.formrows = this.fields.getFormRows('edit');
        this.source = JSON.parse( self.inputfield.value() || "{}" );
        // we need to format the date (YYYY-MM-DDTHH:MM+HH:MM), because the inputfield expects a string in the format YYYY-MM-DDTHH:MM
        // also we assume we are getting an UTC date. Then we convert it to the given Timezone.
        let dateStr = this.source.date.substring(0, 16);
        let timezone = this.source.tz || "UTC";
        let date = moment.tz(dateStr, "UTC").tz(timezone);
        console.log("date", date, timezone, dateStr);
        this.source.date = date.format('YYYY-MM-DDTHH:mm');

        this.form = new Form( this.formrows, this.source);

        this.inputfield.validate = function() {
            console.log("overridden validate() method");
            let res = self.form.validate();

            if( res ) {
                console.log("validation ok", self.form.getValues() );
                let v = self.form.getValues();
                let d = v.date;
                let r = moment.tz(d, v.tz);
                let u = r.clone().tz("UTC");
                console.log("moment", r.format() );
                let currentvalue = JSON.stringify( {
                    tz: v.tz,
                    date: u.format()
                })
                self.inputfield.value( currentvalue );
            }
            return res;
        }
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