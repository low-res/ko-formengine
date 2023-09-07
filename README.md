# ko-formengine

create forms from given configuration

This package provides two models that can represent a form and its input fields. In addition, there are two matching
KnockoutJS components that take over the frontend output of a form and the associated input fields. The definition of
the form fields can be done purely declaratively. The form field definitions from the package ko-fielddefinitions are
used for this.

For form fields, there is a set of predefined field types whose representation and functionality is taken over by the
enclosed KnockoutJS components. However, you can also define your own components as form field types.

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
* json (a nested form will be displayed showing a formfield for every key the JSON string should have. Only "plain" JSON
  objects are supported at the moment)
* datetime-tz (datetime input with additional timezone input)

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

The **json** type needs an additional param in fielddefinition holding the definition of the formfields that schould be
displayed.

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

For **select2** one can define, that the options are fetched from a server via some endpoint. To archive this, the
fielddefinition
must have an object with the key **remoteOptions**. This object must have an attribute with the key url, that holds the
url to
the desired endpoint. It can hold other attributes. everything defined here is passed directly to the ajax option of
select2, like
it is described here: https://select2.org/data-sources/ajax. The endpoint should return the options in the format
described in the select2 docs
(https://select2.org/data-sources/formats) or must be converted into this format in the processResults callback

Additionally you can define a **preselectedOptionCallback**. This is a method, that is called with the id of the
preselected option. It should return a promisse, that resolves with the preselected option. This option will be
preselected in the select2 field. This is usefull, if you want to display the label of the preselected option in the
select2 field, when you show the formfield.

Example fielddefinition:

    {
                name:'selecttest',
                label:'selecttest label',
                valueAccessor: 'selecttest',
                type:'select2',
                options: [],
                remoteOptions: {
                    url: '/demo/select2Remotedata.json',
                    processResults : function( data ){
                        data.results.push({id:3,text:"postprocessed option"});
                        return data;
                    }
                },
                preselectedOptionCallback: function( id ){
                    // some mehtod that fetches the preselectedOption and returns a promisse
                }
                optionsValue:'value',
                optionsText:'label'
            },

**datetime-tz** is a datetime input with an additional timezone input. The value of this field is a JSON string in the form
of:

    {
        "date": "2021-03-01T00:00:00",
        "timezone": "Europe/Berlin"
    }

The date is always UTC. The conversion from/to the selected timezone is handeled automatically

inputmasks can be defined in the fielddefinition. The inputmask is applied automatically if the attributes mask, mask_slots and mask_accept
are available in the fielddefinition. mask_accept can be any string that can be interpreted as RegEx. 
Example:

    {
        name:'inputmask',
        label:'inputmask',
        valueAccessor: 'inputmask',
        type:'input',
        mask: '__.__.____',
        mask_slots:  '_',
        mask_accept: '\d'
    }