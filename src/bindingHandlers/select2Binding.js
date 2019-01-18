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
                var idProp          = bindingData.optionsValue ? bindingData.optionsValue : bindingData.optionsText;

                /**
                 * prepare an data object for select2
                 * (expects dedicated format: https://select2.org/data-sources/formats)
                 */
                var prepareData = function () {
                    var r = [ ];
                    _.forEach( ko.utils.unwrapObservable(bindingData.options), function ( obj ) {
                        if(obj) {

                            var t = "";
                            var idValue = ko.utils.unwrapObservable( obj[idProp] );

                            if(_.isFunction(bindingData.optionsText)) {
                                t = bindingData.optionsText(obj);
                            } else {
                                t = ko.utils.unwrapObservable(obj[bindingData.optionsText]);
                            }

                            var tmpItem = {
                                id: idValue,
                                text: t
                            };

                            if(selectedOption && (selectedOption== idValue || ko.utils.unwrapObservable(selectedOption[idProp]) == idValue )) tmpItem.selected = true;
                            r.push( tmpItem );
                        }

                    } );
                    return r;
                };
                bindingData.data = prepareData();
                bindingData.placeholder = bindingData.optionscaption;
                console.log( "++++ INIT SELECT2 ++++", selectedOption, currentvalue );
                console.log( "binding data", bindingData );

                window.$(el)
                    .select2(bindingData)
                    .focus(function () { $(this).select2('open'); });

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
                        if(obj) {
                            return ko.utils.unwrapObservable( obj[idProp] ) == currentValue;
                        } else {
                            return false;
                        }

                    } )
                };
                var currentOption = selectedOption();
                console.log( "--- update select2 ", currentValue, currentOption );
                if(currentOption && bindingData.selectedOption() != currentOption) {
                    bindingData.selectedOption( currentOption );
                }
            }
        };
    }

});