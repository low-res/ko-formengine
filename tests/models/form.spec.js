define([
    "knockout",
    "src/models/form",
    "low-res/ko-fielddefinitions/fieldsCollection",
], function ( ko, Form, FieldsCollection ) {

    describe("form model", function(){

        var fieldDef1, form, source, fielddef2, form2;

        beforeEach( function () {

            source = {
                field1: "999",
                field2: "303",
                dep1: 'A',
                dep2: '2',
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
            });


            fielddef2 = new FieldsCollection( {
               fields: [
                   {name:'dep1', type:'select', valueAccessor:'dep1', options: ['A','B'] },
                   {name:'dep2', type:'select', valueAccessor:'dep2', dependenedOptions: function( form ) {
                        var f = form.inputfields();
                        if( f.length > 0 ) {
                            var d1 = form.getInputfield('dep1');
                            var d1Val = d1.getCurrentValue();
                            switch(d1Val) {
                                case 'A':
                                    return ['1','2','3'];
                                    break;

                                case 'B':
                                    return ['9','8'];
                                    break;
                            }
                        } else {
                         return [];
                        }
                       } }
               ],
                collections: [
                    {
                        name:"depform", rows:[
                            ["dep1", "dep2"]
                        ]
                    }]
            });

        });


        it('should validate all fields in the form', function () {
            form = new Form( fieldDef1.getFormRows("editform") );
            form.setSource( source );
            var v = form.validate();
            expect(v).toBeTruthy();
        });


        it('should reset the form (empty all fields)', function () {
            form = new Form( fieldDef1.getFormRows("editform") );
            form.clear();
            var i = form.getInputfield('field1');
            expect(i.getCurrentValue()).toBeNull();
        });


        it('should return an object with the formvalues', function () {
            var expectedValues = {
                field1:999,
                field2:303
            }
            form = new Form( fieldDef1.getFormRows("editform") );
            form.setSource( source );
            var formvalues = form.getValues();
            console.log( "formvalues ", formvalues );
            expect(formvalues).toEqual(expectedValues);
        });


        it('should be possible to define simple dependencies between fields. Change available options depending of value of other field', function(){
            form = new Form( fielddef2.getFormRows("depform"), source );
            var d1 = form.getInputfield('dep1');
            var d2 = form.getInputfield('dep2');

            expect( d1.getCurrentValue() ).toEqual( source.dep1 );
            expect( d2.getCurrentValue() ).toEqual( source.dep2 );

            expect( d2.fielddef.options() ).toEqual(['1','2','3']);
            d1.setCurrentValue('B');
            expect( d2.fielddef.options() ).toEqual(['9','8']);

            d1.setCurrentValue('A');
            expect( d2.fielddef.options() ).toEqual(['1','2','3']);

        });
    });

});