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

            prepData: function( bindingData ) {

                var idProp          = bindingData.optionsValue ? bindingData.optionsValue : bindingData.optionsText;
                var selectedOption  = bindingData.selectedOption( ); // == inputfield.value (is an observable)
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
            },

            init: function (el, valueAccessor, allBindingsAccessor, viewModel) {
                var bindingData     = ko.unwrap(valueAccessor());
                var allBindings     = ko.unwrap(allBindingsAccessor());
                var currentvalue    = ko.utils.unwrapObservable( bindingData.selectedOption );
                // var currentvalue    = ko.utils.unwrapObservable( allBindings.value );

                bindingData.data = ko.bindingHandlers.select2.prepData( bindingData );
                bindingData.placeholder = bindingData.optionscaption;

                if(bindingData.remoteOptions && bindingData.remoteOptions.url ) {
                    bindingData.ajax = bindingData.remoteOptions
                    bindingData.minimumInputLength = 3;
                }

                console.log( "++++ INIT SELECT2 ++++", currentvalue );
                console.log( "binding data", bindingData );
                console.log( "allBindings data", allBindings );

                window.$(el)
                    .select2( bindingData )
                    .focus(function () { $(this).select2('open'); });

                // if select2 has remote options add the preselected option
                if(bindingData.remoteOptions && bindingData.remoteOptions.url ) {
                    console.log("append current selection ", currentvalue, allBindings)
                    console.log( "preselectedOptionCallback", bindingData )
                    if(bindingData.preselectedOptionCallback) {
                        var idProp = bindingData.optionsValue ? bindingData.optionsValue : bindingData.optionsText;

                        bindingData.preselectedOptionCallback(currentvalue)
                            .then( function( preselectedOption ) {
                                let o = preselectedOption.data;
                                let id = o[idProp];
                                let text = ""

                                if(_.isFunction(bindingData.optionsText)) {
                                    text = bindingData.optionsText(o);
                                } else {
                                    text = ko.utils.unwrapObservable(o[bindingData.optionsText]);
                                }
                                console.log("preselectedOption", o, idProp, id, text);

                                var option = new Option(text, id, true, true);
                                window.$(el).append(option).trigger('change');
                            });
                    }

                }

                ko.utils.domNodeDisposal.addDisposeCallback(el, function () {
                    window.$(el).select2('destroy');
                });
            },

            update: function (el, valueAccessor, allBindingsAccessor) {

                var allBindings     = allBindingsAccessor();
                var currentValue    = allBindings.value() ;
                var bindingData     = ko.unwrap( valueAccessor() );
                currentValue = currentValue ? currentValue : window.$(el).val();
                console.log( "+++ UPDATE", currentValue );

                var currentOption = function () {
                    if(bindingData.remoteOptions && bindingData.remoteOptions.url ) {
                        return window.$(el).val();
                    } else {
                        var idProp = bindingData.optionsValue ? bindingData.optionsValue : bindingData.optionsText;
                        return _.find( ko.utils.unwrapObservable(bindingData.options), function (obj) {
                            if(obj) {
                                return ko.utils.unwrapObservable( obj[idProp] ) == currentValue;
                            } else {
                                return false;
                            }
                        } )
                    }
                };
                //var currentOption = selectedOption();
                console.log( "--- update select2 ", currentValue, currentOption() );
                if(_.isEmpty(currentValue) ) window.$(el).val(null).trigger('change');
                if(currentOption && bindingData.selectedOption() != currentOption() ) {
                    bindingData.selectedOption( currentOption() );
                }
            }
        };
    }

});