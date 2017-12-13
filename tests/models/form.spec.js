define([
    "knockout",
    "src/models/form",
    "low-res/ko-fielddefinitions/fieldsCollection",
], function ( ko, Form, FieldsCollection ) {

    describe("form model", function(){

        var fieldDef1, form, source;

        beforeEach( function () {

            source = {
                field1: "999",
                field2: "303",
            }

            fieldDef1 = new FieldsCollection( {
                fields: [
                    {name:"field1", label:"Label1", value:ko.observable(123), valueAccessor:'field1', validation:'required|numerical'},
                    {name:"field2", label:"Label2", valueAccessor:'field2', validation:'numerical'}
                ],
                collections: [
                    {
                        name:"editform", rows:[
                            ["field1", "field2"]
                        ]
                    }]
            } );

            form = new Form( fieldDef1.getFormRows("editform") );

        });


        it('should validate all fields in the form', function () {
            form.setSource( source );
            var v = form.validate();
            expect(v).toBeTruthy();
        });


        it('should reset the form (empty all fields)', function () {
            form.clear();
            var i = form.getInputfield('field1');
            expect(i.getCurrentValue()).toBeNull();
        });


        it('should return an object with the formvalues', function () {
            var expectedValues = {
                field1:999,
                field2:303
            }
            form.setSource( source );
            var formvalues = form.getValues();
            console.log( "formvalues ", formvalues );
            expect(formvalues).toEqual(expectedValues);
        });



    });

});