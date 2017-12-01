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
                var bindingData     = ko.unwrap(valueAccessor());
                var allBindings     = ko.unwrap(allBindingsAccessor());
                var currentvalue    = ko.utils.unwrapObservable( allBindings.value );
                var selectedOption  = bindingData.selectedOption( );
                var idProp = bindingData.optionsValue ? bindingData.optionsValue : bindingData.optionsText;
                // allBindings.value( selectedOption[idProp] );

                /**
                 * prepare an data object for select2
                 * (expects dedicated format: https://select2.org/data-sources/formats)
                 */
                var prepareData = function () {
                    var r = [ ];
                    _.forEach( ko.utils.unwrapObservable(bindingData.options), function ( obj ) {

                        var tmpItem = {
                            id: obj[idProp],
                            text: obj[bindingData.optionsText]
                        };

                        if(selectedOption[idProp]==obj[idProp]) tmpItem.selected = true;

                        r.push( tmpItem );
                    } );
                    return r;
                };
                bindingData.data = prepareData();
                bindingData.placeholder = bindingData.optionscaption;
                console.log( "++++ INIT SELECT2 ++++", selectedOption, currentvalue );
                console.log( "binding data", bindingData );

                window.$(el).select2(bindingData);

                ko.utils.domNodeDisposal.addDisposeCallback(el, function () {
                    window.$(el).select2('destroy');
                });
            },

            update: function (el, valueAccessor, allBindingsAccessor) {
                console.log( "+++ UPDATE" );
                var allBindings     = allBindingsAccessor();
                var currentValue    = allBindings.value();
                var bindingData     = ko.unwrap(valueAccessor());

                var selectedOption = function () {
                    var idProp = bindingData.optionsValue ? bindingData.optionsValue : bindingData.optionsText;
                    return _.find( ko.utils.unwrapObservable(bindingData.options), function (obj) {
                        return obj[idProp] == currentValue;
                    } )
                };
                var currentOption = selectedOption();
                console.log( "--- update select2 ", currentValue, currentOption );
                if(currentOption) bindingData.selectedOption( currentOption );

            }

        };

    }

});