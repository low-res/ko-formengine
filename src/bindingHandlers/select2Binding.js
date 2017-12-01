/**
 * knockout binding for select2 (https://github.com/select2/select2)
 *
 * Usage:
 * <select data-bind="value: selectedState, select2: { data: states, placeholder: 'Select a State', allowClear: true, formatResult: format }" class="select2" style="width: 200px"></select>
 * Selected: <span data-bind="text: selectedState"></span>
 */

define([
    "knockout",
    "lodash",
    "select2/select2",
    "select2/select2/css/select2.css!css",
], function (ko, _) {

    if( ko.bindingHandlers.select2 == undefined ) {

        ko.bindingHandlers.select2 = {

            init: function (el, valueAccessor, allBindingsAccessor, viewModel) {
                var bindingData = ko.unwrap(valueAccessor());

                /**
                 * prepare an data object for select2
                 * (expects dedicated format: https://select2.org/data-sources/formats)
                 */
                var prepareData = function () {
                    var r = [];
                    _.forEach( ko.utils.unwrapObservable(bindingData.options), function ( obj ) {
                        var idProp = bindingData.optionsValue ? bindingData.optionsValue : bindingData.optionsText;

                        var tmpItem = {
                            id: obj[idProp],
                            text: obj[bindingData.optionsText]
                        };
                        r.push( tmpItem );
                    } );
                    return r;
                };
                bindingData.data = prepareData();
                console.log( "++++ INIT SELECT2 ++++", bindingData, window.$(el) );

                window.$(el).select2(bindingData);

                ko.utils.domNodeDisposal.addDisposeCallback(el, function () {
                    window.$(el).select2('destroy');
                });
            },
            update: function (el, valueAccessor, allBindingsAccessor, viewModel) {
                var allBindings = allBindingsAccessor();
                var select2 = window.$(el).data("select2");
                if ("value" in allBindings) {
                    var newValue = "" + ko.unwrap(allBindings.value);
                    if ((allBindings.select2.multiple || el.multiple) && newValue.constructor !== Array) {
                        select2.val([newValue.split(",")]);
                    }
                    else {
                        select2.val([newValue]);
                    }
                }
            }
        };

    }

});