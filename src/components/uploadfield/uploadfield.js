define([
    'knockout',
    'lodash',
    './uploadfield-view.html!text',
    './uploadfield-styles.css!css'
], function (ko, _, templateMarkup) {

    var p = FileUploadInputField.prototype;

    function FileUploadInputField( params ) {
        var self = this;
        this.inputfield = params.inputfield;
        this.uniqueName = "upload_"+this.inputfield.getFieldDefinition().name;
        this.multiple = this.inputfield.getFieldDefinition().multiple ? "multiple" : "";
        this.recalcTrigger = ko.observable();
        this.inputfield.value = ko.pureComputed( function() {
            var dummy = self.recalcTrigger();
            return self.getValue();
        });
        this.filelist = ko.pureComputed( function() {
           var l = self.inputfield.value();
           console.log("filelist", l);
            return _.map(l, 'name').join(", ");
        });

        setTimeout( function(){
            var i = self._getFileinputField();
            i.onchange = function(){
                self._triggerUpdateInputValue();
            }
        }, 200);

    }
    
    p.getValue = function () {
        var input = this._getFileinputField();
        // console.log( "__getValue__", input.files );
        return input ? input.files : null;
    }

    p.addFile = function() {
        var input = this._getFileinputField();
        input.click();
    }

    p.removeFiles = function(){
        var i = this._getFileinputField();
        i.value = [];
        this._triggerUpdateInputValue();
    }

    p._getFileinputField = function(){
        return document.getElementById(this.uniqueName);
    }

    p._triggerUpdateInputValue = function () {
        console.log( "change!" );
        this.recalcTrigger( (new Date()).getMilliseconds() );
    }

    return {

        viewModel: {
            createViewModel: function( params, elementInfo ) {
                console.log( "new FileUploadInputField", elementInfo );
                var instance = new FileUploadInputField( params );
                return instance;
            }
        },
        template: templateMarkup
    };

});