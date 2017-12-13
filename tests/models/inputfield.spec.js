define([
    "knockout",
    "src/models/inputfield",
    "low-res/ko-fielddefinitions/field",
], function ( ko, Inputfield, Field ) {

    describe("Inputfield model", function(){

        var field, input, source;

        beforeEach( function () {

            source = {
                field1: "abc",
                field2: "303",
            };

            field = new Field( {name:"field1", label:"Label1", value:ko.observable(123), valueAccessor:'field1', validation:'required|numerical'} );

            input = new Inputfield( field );

        });


        it('should validate the current value', function () {
            var r = input.validate();
            expect(r).toBeTruthy();

            var errors = ko.utils.unwrapObservable(input.errors);
            expect(errors.length).toEqual(0);
        });


        it('should validate the current value when a source is given', function () {
            input.setSource( source );
            var r = input.validate();
            expect(r).toBeFalsy();

            var errors = ko.utils.unwrapObservable(input.errors);
            expect(errors.length).toEqual(1);
        });


        it("should validate the value the user typed in", function () {
            input.setCurrentValue("XXX");
            var r = input.validate();
            expect(r).toBeFalsy();
        });


        it('should be possible to clear the field', function () {
            var v = input.getCurrentValue();
            expect(v).toEqual(123);

            input.clear();
            v = input.getCurrentValue();
            expect(v).toEqual( null );
        });


        it('set a value to the field', function () {
            input.setCurrentValue("XXX");
            var v = input.getCurrentValue();
            expect(v).toEqual("XXX");
        });


        it("should set a new value to the inputfield, but not change the value of the sourceobject", function () {
            var sourceValue = source.field1;
            input.setSource( source );
            var v = input.getCurrentValue();
            expect(v).toEqual( sourceValue );

            input.setCurrentValue("XXX");
            v = input.getCurrentValue();
            expect(v).toEqual( "XXX" );
            expect(source.field1).toEqual(sourceValue);

        })
    });
});