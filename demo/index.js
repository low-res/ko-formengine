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
                validation:"required",
                readonly: true
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
                type:'file',
                multiple:true
            },
            {
                name:'customComponent',
                label:'customComponet',
                valueAccessor: 'customComponet',
                type:'component',
                componentName:'custom-component'
            },
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

            },
            {
                name:'select2',
                label:'select2',
                valueAccessor: 'select2',
                type:'select2',
                options: [
                    {
                        label:"A Label",
                        value:"A"
                    },
                    {
                        label:"B Label",
                        value:"B"
                    },
                    {
                        label:"C Label",
                        value:"C"
                    }
                ],
                optionsValue:'value',
                optionsText:'label'
            },

            {
                name:'selecttest',
                label:'remote selecttest label',
                valueAccessor: 'selecttest',
                type:'select2',
                options: [
                    {
                        "id": 2,
                        "text": "remote Option 2"
                    }
                ],
                remoteOptions: {
                    url: '/demo/select2Remotedata.json',
                    processResults : function( data ){
                        data.results.push({id:3,text:"postprocessed option"});
                        return data;
                    }
                },
                optionsValue:'id',
                optionsText:'text'
            },
        ],
        collections:[
            {name:'edit', rows:[['col2', 'col1'],[ 'dep1', 'dep2'], ['timefield','customComponent','file','jsonfield','select2','selecttest']]},
            {name:'remoteoptions', rows:[['selecttest','select2']]}
        ]
    });

    this.formrows = this.fields.getFormRows('edit');
    this.formrows = this.fields.getFormRows('remoteoptions');
    this.source = {
        col1:"col1value",
        col2:"col 2 value",
        dep1:null,
        dep2:null,
        file:null,
        timefield:'00:00',
        customComponet:'custom text',
        jsonfield:'{custom1:"val1", custom2:"val2}',
        selecttest:2,
        select2:'C'
    };

    this.form = new Form(this.formrows, this.source);
    this.formvalues = ko.observable();
    var self = this;
    this.form.addSubmitHandler( function( formvalues ) {
        console.log( "submitHandler", formvalues );
        self.formvalues( JSON.stringify(formvalues) );
    });



    console.log( "start", ko.components.isRegistered("ko-formengine-form") );


    ko.applyBindings(  );

} );
