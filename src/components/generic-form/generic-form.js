define([
    'knockout',
    'lodash',
    './generic-form.html!text'
], function ( ko, _, templateMarkup, styles ) {

    var p = GenericForm.prototype;

    function GenericForm( params ) {
        this.fields     = params.fields;
        this.source     = params.source;
        this.formValues = this._generateFormValues();
    }

    /**
     * create an object for holding the values that are edited inside the
     * form. If possible prefill with corresponding value of source object.
     * @private
     */
    p._generateFormValues = function () {
        var self = this;
        var o = {};
        _.forEach(this.fields, function (def) {
            if(def && def.name) {
                var sourceValue = self.source && self.source[def.name] ? self.source[def.name] : null;
                o[def.name] = sourceValue;
            }
        });
        return o;
    }

    return {
        viewModel: GenericForm,
        template: templateMarkup
    };
});