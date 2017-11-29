define([
    "knockout",
    "jquery",
    "low-res/ko-fielddefinitions/fieldsCollection",
    "src/components/generic-form/generic-form"
], function ( ko, $, FieldsCollection, comp ) {

    describe("generic-form component", function(){

        var appViewModel, $testNode, fieldDef1, GenericFormClass, testForm;

        beforeEach( function () {
            GenericFormClass = comp.viewModel;

            appViewModel = {
                formRows : ko.observableArray(),
                itemToEdit : {
                    field1:303
                }
            };

            fieldDef1 = new FieldsCollection( {
                fields: [
                    {name:"field1", label:"Label1", value:ko.observable(123), valueAccessor:'field1', validation:'required|numerical'}
                    ],
                collections: [ {name:"editform", fields:["field1"]} ]
            } );

            if( !ko.components.isRegistered("ko-formengine-form") ) ko.components.register("ko-formengine-form", comp);

            $testNode = $('<div id="testNode"></div>');
            $('body').append($testNode);
            $testNode.append("<ko-formengine-form params='formRows:formRows, source:itemToEdit'></ko-formengine-form>")
            ko.applyBindings(appViewModel, $testNode.get(0));

            testForm = new GenericFormClass( {formRows:fieldDef1.getFormRows("editform")} );
        });

        it("should display all formfields for given configuration", function( done ) {
            var formFields = fieldDef1.getFormRows("editform");
            appViewModel.formRows( formFields );
            setTimeout(function () {
                console.log( $("#testNode") );
                done();
            },500);
        });

        it("should create object with all formvalues on submit", function () {
            var r = fieldDef1.getFormRows("editform");
            var form = new GenericFormClass( {formRows:r} );
            console.log( r );
           var proxyObj =  form.submit();
           console.log( "proxy:", proxyObj );
            expect(proxyObj.field1).toEqual(303);
        });

        it("should validate all fields on submit", function(){});

        it("should prefill form values if any are given", function(){});

        it("return the current formvalues on submit", function(){});

        it("handle input groups (two form fields side-by-side)", function(){});

        describe("input types", function(){

            it("should handle dates", function(){});

            it("should handle relations", function(){});

        });

    });

});