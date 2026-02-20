<script>
    import FieldsCollection from 'ko-fielddefinitions/fieldsCollection';
    import { Form } from '../src/core/Form.js';
    import { GenericForm } from '../src/svelte/index.js';

    // ─── Field definitions ────────────────────────────────────────────────────

    const fields = new FieldsCollection({
        fields: [
            {
                name: 'col1',
                label: 'Text Field (required)',
                valueAccessor: 'col1',
                validation: 'required',
            },
            {
                name: 'col2',
                label: 'Readonly Field',
                valueAccessor: 'col2',
                readonly: true,
            },
            {
                name: 'timefield',
                label: 'Time',
                valueAccessor: 'timefield',
                type: 'time',
                validation: 'required',
            },
            {
                name: 'datefield',
                label: 'Date',
                valueAccessor: 'datefield',
                type: 'date',
            },
            {
                name: 'textarea',
                label: 'Textarea',
                valueAccessor: 'textarea',
                type: 'text',
            },
            {
                name: 'dep1',
                label: 'Category',
                valueAccessor: 'dep1',
                type: 'select',
                options: [
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                ],
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'dep2',
                label: 'Subcategory (dependent on Category)',
                valueAccessor: 'dep2',
                type: 'select',
                optionsValue: 'value',
                optionsText: 'label',
                dependenedOptions: function (form) {
                    const dep1 = form.getInputfield('dep1');
                    if (!dep1) return [];
                    switch (dep1.getCurrentValue()) {
                        case 'A': return [
                            { label: '1', value: '1' },
                            { label: '2', value: '2' },
                            { label: '3', value: '3' },
                        ];
                        case 'B': return [
                            { label: '9', value: '9' },
                            { label: '8', value: '8' },
                        ];
                        default: return [];
                    }
                }
            },
            {
                name: 'select2field',
                label: 'Select2 (searchable)',
                valueAccessor: 'select2field',
                type: 'select2',
                options: [
                    { label: 'Apple', value: 'apple' },
                    { label: 'Banana', value: 'banana' },
                    { label: 'Cherry', value: 'cherry' },
                    { label: 'Date', value: 'date' },
                ],
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'checkboxes',
                label: 'Checkboxes',
                valueAccessor: 'checkboxes',
                type: 'checkbox',
                selectDeselectAll: true,
                options: [
                    { label: 'Option A', value: 'A' },
                    { label: 'Option B', value: 'B' },
                    { label: 'Option C', value: 'C' },
                ],
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'radiobuttons',
                label: 'Radio Buttons',
                valueAccessor: 'radiobuttons',
                type: 'radio',
                options: [
                    { label: 'Yes', value: 'yes' },
                    { label: 'No', value: 'no' },
                ],
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'multiselect',
                label: 'Multiselect',
                valueAccessor: 'multiselect',
                type: 'multiselect',
                options: [
                    { label: 'Red', value: 'red' },
                    { label: 'Green', value: 'green' },
                    { label: 'Blue', value: 'blue' },
                    { label: 'Yellow', value: 'yellow' },
                ],
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'file',
                label: 'File Upload',
                valueAccessor: 'file',
                type: 'file',
                multiple: true,
            },
            {
                name: 'inputmask',
                label: 'Input Mask (credit card)',
                valueAccessor: 'inputmask',
                placeholder: '____-____-____-____',
                mask: '____-____-____-____',
                mask_slots: '_',
                mask_accept: '[0-9]',
            },
            {
                name: 'datetimetz',
                label: 'Date with Timezone',
                valueAccessor: 'datetimetz',
                type: 'datetime-tz',
                timezones: ['UTC', 'Europe/Berlin', 'Europe/London', 'America/New_York', 'Asia/Tokyo'],
                validation: 'required',
            },
            {
                name: 'jsonfield',
                label: 'Nested JSON Form',
                valueAccessor: 'jsonfield',
                type: 'json',
                fields: [
                    { name: 'street', label: 'Street', valueAccessor: 'street', validation: 'required' },
                    { name: 'city',   label: 'City',   valueAccessor: 'city',   validation: 'required' },
                ],
            },
        ],
        collections: [
            {
                name: 'basic',
                rows: [['col1', 'col2'], ['timefield', 'datefield'], ['textarea']]
            },
            {
                name: 'selects',
                rows: [['dep1', 'dep2'], ['select2field'], ['checkboxes', 'radiobuttons']]
            },
            {
                name: 'advanced',
                rows: [['multiselect'], ['file', 'inputmask'], ['datetimetz'], ['jsonfield']]
            },
        ]
    });

    // ─── Source data ──────────────────────────────────────────────────────────

    const source = {
        col1: 'Hello World',
        col2: 'Readonly value',
        timefield: '09:30',
        dep1: 'A',
        multiselect: ['red', 'blue'],
        datetimetz: JSON.stringify({ tz: 'Europe/Berlin', date: new Date().toISOString() }),
    };

    // ─── Forms ────────────────────────────────────────────────────────────────

    const basicForm = new Form(fields.getFormRows('basic'), source);
    const selectsForm = new Form(fields.getFormRows('selects'), source);
    const advancedForm = new Form(fields.getFormRows('advanced'), source);

    let result = $state(null);

    basicForm.addSubmitHandler(values => {
        result = values;
    });

    basicForm.addDismissHandler(() => {
        basicForm.clear();
        result = null;
    });

    selectsForm.addSubmitHandler(values => { result = values; });
    advancedForm.addSubmitHandler(values => { result = values; });

    let activeTab = $state('basic');
</script>

<main>
    <h1>@low-res/formengine Demo</h1>

    <nav class="tabs">
        <button class:active={activeTab === 'basic'}    onclick={() => activeTab = 'basic'}>Basic Fields</button>
        <button class:active={activeTab === 'selects'}  onclick={() => activeTab = 'selects'}>Selects & Choices</button>
        <button class:active={activeTab === 'advanced'} onclick={() => activeTab = 'advanced'}>Advanced</button>
    </nav>

    <div class="form-container">
        {#if activeTab === 'basic'}
            <GenericForm form={basicForm} />
        {:else if activeTab === 'selects'}
            <GenericForm form={selectsForm} showButtons={false} />
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem">
                <button class="submit-btn" onclick={() => {
                    if (selectsForm.validate()) result = selectsForm.getValues();
                }}>Get Values</button>
            </div>
        {:else if activeTab === 'advanced'}
            <GenericForm form={advancedForm} showButtons={false} />
            <div style="margin-top: 1rem">
                <button class="submit-btn" onclick={() => {
                    if (advancedForm.validate()) result = advancedForm.getValues();
                }}>Get Values</button>
            </div>
        {/if}
    </div>

    {#if result}
        <div class="result">
            <h2>Form Values</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    {/if}
</main>

<style>
    :global(*, *::before, *::after) {
        box-sizing: border-box;
    }

    :global(body) {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        color: #333;
    }

    main {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    h1 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #222;
    }

    .tabs {
        display: flex;
        gap: 0;
        margin-bottom: 0;
        border-bottom: 2px solid #dee2e6;
    }

    .tabs button {
        padding: 0.6rem 1.25rem;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.9rem;
        color: #666;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: color 0.15s;
    }

    .tabs button.active {
        color: #007bff;
        border-bottom-color: #007bff;
        font-weight: 600;
    }

    .tabs button:hover:not(.active) {
        color: #333;
    }

    .form-container {
        background: white;
        border: 1px solid #dee2e6;
        border-top: none;
        border-radius: 0 0 6px 6px;
        padding: 1.5rem;
    }

    .result {
        margin-top: 1.5rem;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 1rem 1.5rem;
    }

    .result h2 {
        font-size: 1rem;
        margin: 0 0 0.75rem;
        color: #555;
    }

    pre {
        background: #f8f9fa;
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 0.75rem;
        font-size: 0.8rem;
        overflow-x: auto;
        margin: 0;
    }

    .submit-btn {
        padding: 0.5rem 1.25rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .submit-btn:hover {
        background: #0056b3;
    }
</style>
