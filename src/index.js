define([
    "knockout",
    "./components/generic-form/generic-form",
    "./components/formfield/formfield",
    "./bindingHandlers/select2Binding"
], function (ko, formcomponent, fieldcomponent) {

    if(!ko.components.isRegistered("ko-formengine-form")) ko.components.register("ko-formengine-form", formcomponent);
    if(!ko.components.isRegistered("ko-formengine-field")) ko.components.register("ko-formengine-field", fieldcomponent);

});