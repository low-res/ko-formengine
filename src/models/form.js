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

        this.submitHandlers = [];
        this.dismissHandlers= [];

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


    /**
     * calls all registered submithandlers
     */
    p.submit = function() {
        var values = this.getValues();
        this.submitHandlers.forEach( function(handler) {
            if(_.isFunction(handler)) handler( values );
        } );
    }


    /**
     * calls all registered dimiss handlers
     */
    p.dismiss = function(){
        var values = this.getValues();
        this.dismissHandlers.forEach( function(handler) {
            if(_.isFunction(handler)) handler( values );
        } );
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


    /**
     * returns an array containing all fieldnames of this form
     * @return {*}
     */
    p.getAllFieldnames = function () {
        return _.map(this.inputfields(), function( tmpInputfield ) {
            return tmpInputfield.getFieldDefinition().name;
        });
    }


    p.addSubmitHandler = function( handler ) {
        if(_.isFunction(handler)) {
            this.submitHandlers.push(handler);
        } else {
            throw new Error("only functions can be added as submit handler");
        }
    }


    p.addDismissHandler = function( handler ) {
        if(_.isFunction(handler)) {
            this.dismissHandlers.push(handler);
        } else {
            throw new Error("only functions can be added as dismiss handler");
        }
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
        var self = this;
        var fields = [];
        var source = this.source;
        var form = this;

        _.forEach(ko.utils.unwrapObservable(this.formRows), function (row) {
            _.forEach(row, function (def) {

                if( def.field ) {
                    var tmpInputfield = new Inputfield( def.field, source);
                    tmpInputfield.setContext( form );
                    fields.push( tmpInputfield );
                    if(!def.inputfield) def.inputfield = tmpInputfield;
                    self._handleDependendOptions( def.field, tmpInputfield, form );
                }
            });
        });
        this.inputfields( fields );

        console.log( "_prepareInputfieldModels", this.inputfields( ) );
    }


    /**
     * That's quite a hack, but I can't think of a better way right now. This should help to realize dependent form
     * fields (selects). It creates an computed observable from the given function
     * to be called in the context of the form
     *
     * @private
     */
    p._handleDependendOptions = function( fielddef, inputfield, form ) {
        if( (fielddef.type == "select" /*|| fielddef.type == "select2" */) && fielddef.dependenedOptions ) {

            var f = _.bind( fielddef.dependenedOptions, inputfield, form );
            fielddef.options = ko.computed( f );

        }

        if( fielddef.type == "select2"  && fielddef.dependenedOptions ) {
            console.warn( "Support of dependenedOptions on select2 formfields is not supported (yet)!" );
        }
    }

    return Form;

});