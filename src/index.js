define([
    "knockout",
    "./components/generic-form/generic-form",
    "./components/formfield/formfield",
    "./components/uploadfield/uploadfield",
    "./components/customComponentJsonForm/customComponentJsonForm",
    "./bindingHandlers/select2Binding"
], function (ko, formcomponent, fieldcomponent, uploadcomponent, customComponentJsonForm) {

    if(!ko.components.isRegistered("ko-formengine-form")) ko.components.register("ko-formengine-form", formcomponent);
    if(!ko.components.isRegistered("ko-formengine-field")) ko.components.register("ko-formengine-field", fieldcomponent);
    if(!ko.components.isRegistered("ko-formengine-fileupload")) ko.components.register("ko-formengine-fileupload", uploadcomponent);
    if(!ko.components.isRegistered("custom-json-form")) ko.components.register("custom-json-form", customComponentJsonForm);

});