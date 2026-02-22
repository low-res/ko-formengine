<script>
    import FieldsCollection from 'ko-fielddefinitions/fieldsCollection';
    import { Form } from '../src/core/Form.js';
    import { GenericForm } from '../src/svelte/index.js';
    import CustomLayoutForm from './CustomLayoutForm.svelte';

    // ─── Tab 1: Text inputs ───────────────────────────────────────────────────

    const textFields = new FieldsCollection({
        fields: [
            {
                name: 'text_input',
                label: 'input (text)',
                valueAccessor: 'text_input',
                type: 'input',
                placeholder: 'Type something…',
                validation: 'required',
            },
            {
                name: 'text_readonly',
                label: 'input (readonly)',
                valueAccessor: 'text_readonly',
                type: 'input',
                readonly: true,
            },
            {
                name: 'text_password',
                label: 'password',
                valueAccessor: 'text_password',
                type: 'password',
            },
            {
                name: 'text_email',
                label: 'input (email, validation: required|email)',
                valueAccessor: 'text_email',
                type: 'input',
                keyboardtype: 'email',
                placeholder: 'user@example.com',
                validation: 'required|email',
            },
            {
                name: 'text_textarea',
                label: 'text (textarea)',
                valueAccessor: 'text_textarea',
                type: 'text',
                placeholder: 'Multi-line text…',
            },
            {
                name: 'text_mask',
                label: 'input (mask: credit card)',
                valueAccessor: 'text_mask',
                type: 'input',
                placeholder: '____-____-____-____',
                mask: '____-____-____-____',
                mask_slots: '_',
                mask_accept: '[0-9]',
            },
        ],
        collections: [
            {
                name: 'all',
                rows: [
                    ['text_input', 'text_readonly'],
                    ['text_password', 'text_email'],
                    ['text_textarea'],
                    ['text_mask'],
                ]
            }
        ]
    });

    // ─── Tab 2: Date & Time ───────────────────────────────────────────────────

    const dateFields = new FieldsCollection({
        fields: [
            {
                name: 'dt_date',
                label: 'date',
                valueAccessor: 'dt_date',
                type: 'date',
            },
            {
                name: 'dt_datetime',
                label: 'datetime',
                valueAccessor: 'dt_datetime',
                type: 'datetime',
            },
            {
                name: 'dt_time',
                label: 'time',
                valueAccessor: 'dt_time',
                type: 'time',
            },
            {
                name: 'dt_tz',
                label: 'datetime-tz (with timezone)',
                valueAccessor: 'dt_tz',
                type: 'datetime-tz',
                timezones: ['UTC', 'Europe/Berlin', 'Europe/London', 'America/New_York', 'Asia/Tokyo'],
                validation: 'required',
            },
        ],
        collections: [
            {
                name: 'all',
                rows: [
                    ['dt_date', 'dt_datetime', 'dt_time'],
                    ['dt_tz'],
                ]
            }
        ]
    });

    // ─── Tab 3: Selection fields ──────────────────────────────────────────────

    const COLOR_OPTIONS = [
        { label: 'Red',    value: 'red'    },
        { label: 'Green',  value: 'green'  },
        { label: 'Blue',   value: 'blue'   },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Purple', value: 'purple' },
    ];

    const FRUIT_OPTIONS = [
        { label: 'Apple',  value: 'apple'  },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
        { label: 'Date',   value: 'date'   },
        { label: 'Elderberry', value: 'elderberry' },
    ];

    const selectFields = new FieldsCollection({
        fields: [
            {
                name: 'sel_single',
                label: 'select (single)',
                valueAccessor: 'sel_single',
                type: 'select',
                options: COLOR_OPTIONS,
                optionsValue: 'value',
                optionsText: 'label',
                optionscaption: 'general.optionscaption',
            },
            {
                name: 'sel_multiple',
                label: 'select (multiple)',
                valueAccessor: 'sel_multiple',
                type: 'select',
                multiple: true,
                size: 5,
                options: COLOR_OPTIONS,
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'sel_select2',
                label: 'select2 (searchable)',
                valueAccessor: 'sel_select2',
                type: 'select2',
                options: FRUIT_OPTIONS,
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'sel_multiselect',
                label: 'multiselect (custom dropdown)',
                valueAccessor: 'sel_multiselect',
                type: 'multiselect',
                options: FRUIT_OPTIONS,
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'sel_radio',
                label: 'radio',
                valueAccessor: 'sel_radio',
                type: 'radio',
                options: [
                    { label: 'Yes', value: 'yes' },
                    { label: 'No',  value: 'no'  },
                    { label: 'Maybe', value: 'maybe' },
                ],
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'sel_checkbox',
                label: 'checkbox (multi)',
                valueAccessor: 'sel_checkbox',
                type: 'checkbox',
                selectDeselectAll: true,
                options: COLOR_OPTIONS,
                optionsValue: 'value',
                optionsText: 'label',
            },
            {
                name: 'sel_dep1',
                label: 'Category (dependent)',
                valueAccessor: 'sel_dep1',
                type: 'select',
                options: [
                    { label: 'Fruits', value: 'fruits' },
                    { label: 'Colors', value: 'colors' },
                ],
                optionsValue: 'value',
                optionsText: 'label',
                optionscaption: 'general.optionscaption',
            },
            {
                name: 'sel_dep2',
                label: 'Subcategory (depends on Category)',
                valueAccessor: 'sel_dep2',
                type: 'select',
                options: [],
                optionsValue: 'value',
                optionsText: 'label',
                optionscaption: 'general.optionscaption',
                dependenedOptions(form) {
                    const cat = form.getInputfield('sel_dep1')?.getCurrentValue();
                    if (cat === 'fruits') return FRUIT_OPTIONS;
                    if (cat === 'colors') return COLOR_OPTIONS;
                    return [];
                }
            },
        ],
        collections: [
            {
                name: 'all',
                rows: [
                    ['sel_single', 'sel_multiple'],
                    ['sel_select2', 'sel_multiselect'],
                    ['sel_radio', 'sel_checkbox'],
                    ['sel_dep1', 'sel_dep2'],
                ]
            }
        ]
    });

    // ─── Tab 4: Advanced ──────────────────────────────────────────────────────

    const advancedFields = new FieldsCollection({
        fields: [
            {
                name: 'adv_file_single',
                label: 'file (single)',
                valueAccessor: 'adv_file_single',
                type: 'file',
            },
            {
                name: 'adv_file_multi',
                label: 'file (multiple)',
                valueAccessor: 'adv_file_multi',
                type: 'file',
                multiple: true,
            },
            {
                name: 'adv_json',
                label: 'json (nested form)',
                valueAccessor: 'adv_json',
                type: 'json',
                fields: [
                    { name: 'street', label: 'Street', valueAccessor: 'street' },
                    { name: 'city',   label: 'City',   valueAccessor: 'city',   validation: 'required' },
                    { name: 'zip',    label: 'ZIP',    valueAccessor: 'zip' },
                ],
            },
        ],
        collections: [
            {
                name: 'all',
                rows: [
                    ['adv_file_single', 'adv_file_multi'],
                    ['adv_json'],
                ]
            }
        ]
    });

    // ─── Tab 5: Custom Layout ─────────────────────────────────────────────────

    const COUNTRY_OPTIONS = [
        { label: 'Germany',     value: 'de' },
        { label: 'Austria',     value: 'at' },
        { label: 'Switzerland', value: 'ch' },
        { label: 'Other',       value: 'other' },
    ];

    const profileFields = new FieldsCollection({
        fields: [
            { name: 'first_name', label: 'First Name', valueAccessor: 'first_name', type: 'input', validation: 'required' },
            { name: 'last_name',  label: 'Last Name',  valueAccessor: 'last_name',  type: 'input', validation: 'required' },
            { name: 'email',      label: 'E-Mail',     valueAccessor: 'email',      type: 'input', keyboardtype: 'email', validation: 'required|email' },
            { name: 'street',     label: 'Street',     valueAccessor: 'street',     type: 'input' },
            { name: 'zip',        label: 'ZIP',        valueAccessor: 'zip',        type: 'input' },
            { name: 'city',       label: 'City',       valueAccessor: 'city',       type: 'input' },
            { name: 'country',    label: 'Country',    valueAccessor: 'country',    type: 'select',
                options: COUNTRY_OPTIONS, optionsValue: 'value', optionsText: 'label',
                optionscaption: 'general.optionscaption',
            },
            { name: 'bio',        label: 'Short Bio',  valueAccessor: 'bio',        type: 'text', placeholder: 'Tell us about yourself…' },
            { name: 'website',    label: 'Website',    valueAccessor: 'website',    type: 'input', placeholder: 'https://…' },
        ],
        collections: [{
            name: 'all',
            rows: [
                ['first_name', 'last_name'],
                ['email'],
                ['street'],
                ['zip', 'city'],
                ['country'],
                ['bio'],
                ['website'],
            ]
        }]
    });

    // ─── Forms ────────────────────────────────────────────────────────────────

    const source = {
        text_input:    'Hello World',
        text_readonly: 'Cannot edit this',
        dt_date:       '2024-06-01',
        dt_time:       '09:30',
        dt_tz:         JSON.stringify({ tz: 'Europe/Berlin', date: new Date().toISOString() }),
        sel_single:    'green',
        sel_multiple:  ['red', 'blue'],
        sel_radio:     'yes',
        sel_checkbox:  ['red', 'yellow'],
    };

    const textForm     = new Form(textFields.getFormRows('all'),     source);
    const dateForm     = new Form(dateFields.getFormRows('all'),     source);
    const selectForm   = new Form(selectFields.getFormRows('all'),   source);
    const advancedForm = new Form(advancedFields.getFormRows('all'), source);
    const profileForm  = new Form(profileFields.getFormRows('all'),  { first_name: 'Jane', last_name: 'Doe' });

    let result = $state(null);

    [textForm, dateForm, selectForm, advancedForm, profileForm].forEach(form => {
        form.addSubmitHandler(values => { result = values; });
    });

    let activeTab = $state('text');
</script>

<main>
    <h1>@low-res/formengine — Field Type Demo</h1>

    <nav class="tabs">
        <button class:active={activeTab === 'text'}     onclick={() => { activeTab = 'text';     result = null; }}>Text Inputs</button>
        <button class:active={activeTab === 'datetime'} onclick={() => { activeTab = 'datetime'; result = null; }}>Date & Time</button>
        <button class:active={activeTab === 'select'}   onclick={() => { activeTab = 'select';   result = null; }}>Selection</button>
        <button class:active={activeTab === 'advanced'} onclick={() => { activeTab = 'advanced'; result = null; }}>Advanced</button>
        <button class:active={activeTab === 'custom'}   onclick={() => { activeTab = 'custom';   result = null; }}>Custom Layout</button>
    </nav>

    <div class="form-container">
        {#if activeTab === 'text'}
            <GenericForm form={textForm} />
        {:else if activeTab === 'datetime'}
            <GenericForm form={dateForm} />
        {:else if activeTab === 'select'}
            <GenericForm form={selectForm} showButtons={false} />
            <div class="action-row">
                <button class="btn-primary" onclick={() => {
                    if (selectForm.validate()) result = selectForm.getValues();
                }}>Get Values</button>
            </div>
        {:else if activeTab === 'advanced'}
            <GenericForm form={advancedForm} />
        {:else if activeTab === 'custom'}
            <CustomLayoutForm form={profileForm} />
        {/if}
    </div>

    {#if result}
        <div class="result">
            <h2>Submitted Values</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    {/if}
</main>

<style>
    :global(*, *::before, *::after) { box-sizing: border-box; }

    :global(body) {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        color: #333;
    }

    main {
        max-width: 860px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    h1 {
        font-size: 1.4rem;
        margin-bottom: 1.5rem;
        color: #222;
    }

    .tabs {
        display: flex;
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

    .tabs button:hover:not(.active) { color: #333; }

    .form-container {
        background: white;
        border: 1px solid #dee2e6;
        border-top: none;
        border-radius: 0 0 6px 6px;
        padding: 1.5rem;
    }

    .action-row {
        margin-top: 1rem;
        display: flex;
        justify-content: flex-end;
    }

    .btn-primary {
        padding: 0.5rem 1.25rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .btn-primary:hover { background: #0056b3; }

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
</style>
