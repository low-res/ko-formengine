# ko-formengine

create forms from given configuration

This package provides two models that can represent a form and its input fields. In addition, there are two matching KnockoutJS components that take over the frontend output of a form and the associated input fields. The definition of the form fields can be done purely declaratively. The form field definitions from the package ko-fielddefinitions are used for this.

For form fields, there is a set of predefined field types whose representation and functionality is taken over by the enclosed KnockoutJS components. However, you can also define your own components as form field types.

Predefined form types are:
* input
* password
* date
* datetime
* select
* select2 (select with integrated search)
* radio
* checkbox
* text
* file (fileupload)
* time (the inputfiledvalue will nevertheless contain a date + time )
* json (a nested form will be displayed showing a formfield for every key the JSON string should have. Only "plain" JSON objects are supported at the moment)

Custom components can be integrated with a fielddefinition like:

    {
        name:'fieldname',
        label:'fieldlabel',
        valueAccessor: 'accessor of value',
        type:'component',
        componentName:'custom-component'
    }

**type:"componet"** and a valid component in **componentName** are mandatory.

Make sure to set the value of the inputfield from your custom component:

    this.inputfield.value( <your inputfield value> );

The **fileupload** component can be configured to allow multiple files or just a single file:

    {
        name:'fieldname',
        label:'fieldlabel',
        valueAccessor: 'accessor of value',
        type:'file',
        multiple:'true' 
    }


The **json** type needs an additional param in fielddefinition holding the definition of the formfields that schould be displayed.

    {
                name:'jsonfield',
                label:'json',
                valueAccessor: 'json',
                type:'json',
                fields: [
                    {
                        name: 'custom1',
                        label: 'custom1',
                        valueAccessor: 'custom1',
                        validation:"required"
                    },
                    {
                        name: 'custom2',
                        label: 'custom2',
                        valueAccessor: 'custom2',
                        validation:"required"
                    }
                ]
            }