/* */

define([
    'knockout',
    'lodash',
    './inputfield'
], function (ko, _, Inputfield) {

    var p = Form.prototype;

    function Form( formRows, source ) {
        this.formRows       = formRows;
        this.inputfields    = ko.observableArray();
        this.source         = source;

        this._prepareInputfieldModels();
    }


    p.validate = function () {
        var v = true;
        var fields = this.inputfields();
        _.forEach(fields, function (tmpInputfield) {
            var tmpValidate = tmpInputfield.validate();
            v = v && tmpValidate;
        });
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
            if(fieldname) {
                _.set(v, fieldname, fieldvalue);
            }
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
        var source = this.source;
        var form = this;

        _.forEach(ko.utils.unwrapObservable(this.formRows), function (row) {
            _.forEach(row, function (def) {

                if( def.field ) {
                    var tmpInputfield = new Inputfield(def.field, source);
                    tmpInputfield.setContext(form);
                    fields.push( tmpInputfield );
                    if(!def.inputfield) def.inputfield = tmpInputfield;
                }
            });
        });
        this.inputfields( fields );

        console.log( "_prepareInputfieldModels", this.inputfields( ) );
    }

    return Form;

});