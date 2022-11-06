define( [
    'knockout',
    'low-res/ko-fielddefinitions/fieldsCollection',
    '../src/models/form',
    './customComponent/customComponent',
    'low-res/ko-formengine',
    'low-res/ko-bs-bindings'
], function ( ko, FieldsCollection, Form, customComponent ) {

    if(!ko.components.isRegistered("custom-component")) ko.components.register("custom-component", customComponent);

    this.fields = new FieldsCollection({
        fields:[
            {
                name: 'col1',
                label: 'col1 label',
                valueAccessor: 'col1',
                validation:"required"
            },
            {
                name: 'timefield',
                label: 'timefield',
                valueAccessor: 'timefield',
                type:'time',
                validation:"required"
            },
            {
                name: 'col2',
                label: 'col2 label',
                valueAccessor: 'col2',
                validation:"required"
            },
            {
                name:'dep1',
                label:'dep1 label',
                valueAccessor: 'dep1',
                type:'select',
                options: [
                    {
                        label:"A",
                        value:"A"
                    },
                    {
                        label:"B",
                        value:"B"
                    }
                ],
                optionsValue:'value',
                optionsText:'label'
            },
            {
                name:'dep2',
                label:'dep2 label',
                valueAccessor: 'dep2',
                type:'select',
                optionsValue:'value',
                optionsText:'label',
                dependenedOptions: function( form ) {
                    var f = form.inputfields();
                    var depOptions = [];
                    if( f.length > 0 ) {
                        var d1 = form.getInputfield('dep1');
                        var d1Val = d1.getCurrentValue();
                        console.log( "calculate dependenedOptions", d1Val );
                        switch(d1Val) {
                            case 'A':
                                depOptions = [
                                    {
                                        label:"1",
                                        value:"1"
                                    },
                                    {
                                        label:"2",
                                        value:"2"
                                    },
                                    {
                                        label:"3",
                                        value:"3"
                                    }
                                ];
                                break;

                            case 'B':
                                depOptions = [
                                    {
                                        label:"9",
                                        value:"9"
                                    },
                                    {
                                        label:"8",
                                        value:"8"
                                    }
                                ];
                                break;
                        }
                    }
                    console.log( "dep options", depOptions );
                    return depOptions;
                }
            },
            {
                name:'file',
                label:'file',
                valueAccessor: 'file',
                type:'file'
            },
            {
                name:'customComponent',
                label:'customComponet',
                valueAccessor: 'customComponet',
                type:'component',
                componentName:'custom-component'
            }
        ],
        collections:[
            {name:'edit', fields:['col2', 'col1', 'dep1', 'dep2', 'timefield','customComponent']}
        ]
    });

    this.formrows = this.fields.getFormRows('edit')
    this.source = {
        col1:"col1value",
        col2:"col 2 value",
        dep1:null,
        dep2:null,
        file:null,
        timefield:'00:00',
        customComponet:'custom text'
    };

    this.form = new Form(this.formrows, this.source);
    this.form.addSubmitHandler( function( formvalues ) {
        console.log( "submitHandler", formvalues );
    });

    console.log( "start", ko.components.isRegistered("ko-formengine-form") );


    ko.applyBindings(  );

} );
