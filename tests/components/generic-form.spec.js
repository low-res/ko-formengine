define([
    "knockout",
    "jquery",
    "low-res/ko-fielddefinitions/fieldsCollection",
    "src/components/generic-form/generic-form"
], function ( ko, $, FieldsCollection, comp ) {

    describe("generic-form component", function(){

        var appViewModel, $testNode, fieldDef1, compVm;

        beforeEach( function () {
            compVm = comp.viewModel;

            appViewModel = {
                formFields : ko.observable(),
                itemToEdit : {}
            };

            fieldDef1 = new FieldsCollection( {
                fields: [ {name:"field1", label:"Label1"} ],
                collections: [ {name:"editform", fields:["field1"]} ]
            } );

            if( !ko.components.isRegistered("ko-formengine-form") ) ko.components.register("ko-formengine-form", comp);

            $testNode = $('<div id="testNode"></div>');
            $('body').append($testNode);
            $testNode.append("<ko-formengine-form params='fields:formFields, source:itemToEdit'></ko-formengine-form>")
            ko.applyBindings(appViewModel, $testNode.get(0));
        });

        it('should create an dummy object with all properties that are defined in fielddefinitions', function () {
            var formFields = fieldDef1.getCollectionFields("editform");
            var c = new compVm( {fields:formFields} );
            expect(c.formValues.field1).toBeDefined();
        });

        it("should prefill the formvalues with the corresponding values of the source object", function () {
            var formFields = fieldDef1.getCollectionFields("editform");
            var c = new compVm( {fields:formFields, source:{ field1:123 } } );
            expect(c.formValues.field1).toEqual(12);
        });

        it("should display all formfields for given configuration", function() {
            var formFields = fieldDef1.getCollectionFields("editform");

            appViewModel.formFields( formFields );
            console.log( $("#testNode") );
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