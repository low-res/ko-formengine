/* */
define([
    'knockout',
    'lodash',
    'jquery',
    'low-res/validator',
    'low-res/ko-fielddefinitions/fieldsCollection',
    '../../../models/form',
    './customComponentJsonForm.html!text',
], function (ko, _, $, Validator, FieldsCollection, Form, templateMarkup) {

    var p = CustomComponentJsonForm.prototype;

    function CustomComponentJsonForm(params) {
        var self                = this;

        this.inputfield = params.inputfield;
        this.source = params.source;
        this.fields = this.inputfield.fielddef.fields;

        if(!this.fields) console.error("You must have am param 'fields' in your fielddefinition, that holds the formfields that you wish to be displayed");

        this.fields = new FieldsCollection({
            fields: self.fields,
            collections:[
                {name:'edit', fields:_.map(self.fields, 'name')}
            ]
        });

        this.formrows = this.fields.getFormRows('edit');
        this.source = JSON.parse( self.inputfield.value() || "{}" );
        this.form = new Form( this.formrows, this.source);

        // attach an listener to every formfield, to update the json string
        _.each(this.form.getAllFieldnames(), function( tmpfieldname ){
            let tmpInput = self.form.getInputfield(tmpfieldname);
            console.log("get fieldname", tmpfieldname, tmpInput);
            tmpInput.value.subscribe( function(newValue){
                let parts = self.form.getValues();
                let jsonStr = JSON.stringify(parts);
                self.inputfield.value( jsonStr );
            });
        });

        // override native validate method of original inputfield
        this.inputfield.validate = function(){
            console.log("overridden validate() method");
            return self.form.validate();
        }
    }



    return {
        viewModel: {
            createViewModel: function( params, elementInfo ) {
                var instance = new CustomComponentJsonForm( params );
                var context = ko.contextFor(elementInfo.element);
                var parentForm = context.$parents[1];
                if( parentForm.registerSubcomponent ) {
                    parentForm.registerSubcomponent( instance );
                }
                return instance;
            }
        },
        template: templateMarkup,
        synchronous: true
    };
});