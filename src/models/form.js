
define([
    'knockout',
    'lodash',
    'src/models/inputfield'
], function (ko, _, Inputfield) {

    var p = Form.prototype;

    function Form( formRows, source ) {
        this.formRows       = formRows;
        this.inputfields    = ko.observableArray();
        this.source         = source;

        this._prepareInputfieldModels();
    }


    p.validate = function () {
        var v = _.reduce(this.inputfields(), function (result, tmpInputfield) {
            return result && tmpInputfield.validate();
        }, true);
        return v;
    }


    p.clear = function () {
        _.forEach(this.inputfields(), function (tmpInputfield) {
            tmpInputfield.clear();
        });
    }


    p.setSource = function ( source ) {
        this.source = source;
        _.forEach(this.inputfields(), function (tmpInputfield) {
            tmpInputfield.setSource(source);
        });
    }


    p.getValues = function () {
        var v = {};
        var fieldname, fieldvalue;
        _.forEach(this.inputfields(), function (tmpInputfield) {
            fieldname = tmpInputfield.getFieldDefinition().name;
            fieldvalue = tmpInputfield.getValueForServer();
            v[fieldname] = fieldvalue;
        });
        return v;
    }


    p.getInputfield = function ( fieldname ) {
        return _.find( this.inputfields(), function ( tmpInputfield ) {
            return tmpInputfield.getFieldDefinition().name == fieldname;
        } );
    }


    /*************************************
     *
     *  PRIVATE API
     *
    *************************************/

    /**
     * for every fielddef in formrows, create an inputfield object
     * and inject a reference of each object back into formRow array
     * to easily render whole form.
     * @private
     */
    p._prepareInputfieldModels = function () {
        var fields = [];
        var tmpInputfield;
        var source = this.source;

        _.forEach(ko.utils.unwrapObservable(this.formRows), function (row) {
            _.forEach(row, function (def) {

                if( def.field ) {
                    tmpInputfield = new Inputfield(def.field, source);
                    fields.push( tmpInputfield );

                    if(!def.inputfield) def.inputfield = tmpInputfield;
                }
            });
        });
        this.inputfields( fields );
    }

    return Form;

});