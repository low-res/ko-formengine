/* */
define([
    'knockout',
    'lodash',
    './multiselect.html!text',
    './multiselect.css!css',
], function (ko, _, templateMarkup) {

    var p = Multiselect.prototype;

    function Multiselect(params) {
        var self= this;

        this.inputfield     = params.inputfield;

        this.source         = ko.utils.unwrapObservable(params.source);
        let o = ko.utils.unwrapObservable( this.inputfield.getFieldDefinition().options );
        console.log("inputfield", o);
        this.options        = _.isArray(o) ? ko.observableArray( o ) : [];
        this.searchterm     = ko.observable("");
        this.searchHasFocus = ko.observable(false);
        this.componentIsActive = ko.observable(false);

        this.filteredOptions= ko.pureComputed( function () {
            var term = self.searchterm();

            var res = self.inputfield.getFieldDefinition().options
            if(_.isFunction( self.inputfield.getFieldDefinition().options )) {
                res = self.inputfield.getFieldDefinition().options();
            }

            if(term) {
                res = _.filter( res, function ( option ) {
                    var label = self.getOptionLabel(option);
                    return label.toLowerCase().indexOf(term.toLowerCase()) > -1;
                });
            }

            res = _.filter( res, function ( option ) {
                return self.selection.indexOf(option) == -1;
            });

            return res;
        });

        this.selection = ko.observableArray();
        this.selection.subscribe( function(){
            self.inputfield.value( self.selection() );
        });

        // override native clear method of original inputfield
        this.inputfield.clear = function () {
            if( this._needsArrayAsValue() ) {
                this.setCurrentValue( [] );
            } else {
                this.setCurrentValue( null );
            }

            // restore all options
            self.options( self.options().concat(self.selection()) );

            // clear selection
            self.selection.removeAll();
        }

        // preselect current values
        var currentValue = this.inputfield.value();
        if( currentValue ) {
            _.each( currentValue, function ( value ) {
                var option = _.find( self.options(), function ( option ) {
                    return self.getOptionValue(option) == value;
                });
                if( option ) {
                    self.selectOption(option);
                }
            });
        }


    }


    p.selectOption = function( option ){
        this.selection.push(option);
    }


    p.unselectOption = function( option ){
        this.selection.remove(option);
    }


    p.setFocus = function () {
        this.searchterm("");
        this.searchHasFocus(true);
        this.componentIsActive(true);
    }


    p.unfocus = function () {
        this.searchterm("");
        this.searchHasFocus(false);
        this.componentIsActive(false);
    }


    p.getOptionValue = function ( option ) {
        let optionsValue = this.inputfield.getFieldDefinition().optionsValue;
        if( optionsValue ) {
            if(_.isString(optionsValue)) {
                return ko.utils.unwrapObservable(option[optionsValue]);
            } else if(_.isFunction(optionsValue)) {
                return optionsValue(option, this.inputfield);
            }
        } else {
            return option;
        }
    }


    p.getOptionLabel = function ( option ) {
        let optionsLabel = this.inputfield.getFieldDefinition().optionsText;
        let labelprefix = this.inputfield.getFieldDefinition().labelprefix || "";
        if( optionsLabel ) {
            if(_.isString(optionsLabel)) {
                return ko.utils.unwrapObservable(option[optionsLabel]);
            } else if(_.isFunction(optionsLabel)) {
                return optionsLabel(option, this.inputfield);
            }
        } else {
            return kopa.translate(labelprefix+option);
        }
    }


    return {
        viewModel: {
            createViewModel: function( params, elementInfo ) {
                var instance = new Multiselect( params, elementInfo.element );
                var context = ko.contextFor(elementInfo.element);
                console.log(elementInfo.element.nextSibling);

                // detect click outside to loose focus
                document.addEventListener('click', event => {
                    console.log("click", event.target);
                    const isClickInside = elementInfo.element.nextSibling.contains(event.target)

                    if (!isClickInside) {
                        instance.unfocus();
                    }
                })
                return instance;
            }
        },
        template: templateMarkup,
        synchronous: true
    };
});