/* */
define([
    'knockout',
    'lodash',
    'jquery',
    'low-res/validator',
    './customComponent.html!text',
], function (ko, _, $, Validator, templateMarkup) {

    var p = CustomComponent.prototype;

    function CustomComponent(params) {
        var self                = this;

        console.log("CustomComponent", params);
        this.inputfield = params.inputfield;
        this.source = params.source;
        this.mycomponentValue = ko.observable( this.inputfield.value() );
        this.mycomponentValue.subscribe( function(newValue){
            console.log("soemthing changed in internal value", arguments);
            let parts = newValue.split(",");
            let jsonStr = JSON.stringify(parts);
            self.inputfield.value( jsonStr );
        });
    }



    return {
        viewModel: {
            createViewModel: function( params, elementInfo ) {
                console.log("createViewModel");
                var instance = new CustomComponent( params );
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